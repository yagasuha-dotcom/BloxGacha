import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/app/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return NextResponse.json({ error: 'Belum login.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya admin yang bisa melakukan aksi ini.' }, { status: 403 });
  }

  const { requestId, userId, amount, action } = await req.json();

  if (!requestId || !userId || !amount || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  const service = createServiceClient();

  // Pastikan request masih pending (mencegah double-approve dari klik ganda / race condition)
  const { data: currentRequest } = await service
    .from('topup_requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (currentRequest?.status !== 'pending') {
    return NextResponse.json({ error: 'Permintaan ini sudah diproses sebelumnya.' }, { status: 409 });
  }

  if (action === 'approve') {
    // Tambah saldo user
    const { data: targetProfile, error: fetchError } = await service
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (fetchError || !targetProfile) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const newBalance = Number(targetProfile.balance) + Number(amount);

    const { error: updateBalanceError } = await service
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateBalanceError) {
      return NextResponse.json({ error: 'Gagal memperbarui saldo pengguna.' }, { status: 500 });
    }
  }

  const { error: updateRequestError } = await service
    .from('topup_requests')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateRequestError) {
    return NextResponse.json({ error: 'Gagal memperbarui status permintaan.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
