import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/app/lib/supabase-server';
import { weightedRandomPick } from '@/app/lib/gacha-random';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return NextResponse.json({ error: 'Kamu harus masuk untuk membuka gacha.' }, { status: 401 });
  }

  const { tierId } = await req.json();
  if (!tierId) {
    return NextResponse.json({ error: 'Tier tidak valid.' }, { status: 400 });
  }

  const service = createServiceClient();
  const userId = userData.user.id;

  // Ambil tier & profil sekaligus
  const { data: tier, error: tierError } = await service
    .from('gacha_account_tiers')
    .select('*')
    .eq('id', tierId)
    .eq('is_active', true)
    .single();

  if (tierError || !tier) {
    return NextResponse.json({ error: 'Tier gacha tidak ditemukan atau tidak aktif.' }, { status: 404 });
  }

  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('balance, total_gacha_count')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profil pengguna tidak ditemukan.' }, { status: 404 });
  }

  if (Number(profile.balance) < Number(tier.price)) {
    return NextResponse.json({ error: 'Saldo tidak cukup. Silakan top up terlebih dahulu.' }, { status: 400 });
  }

  // Ambil item yang masih tersedia di pool
  const { data: availableItems, error: itemsError } = await service
    .from('gacha_account_items')
    .select('id, item_name, chance, image_url')
    .eq('tier_id', tierId)
    .eq('is_claimed', false);

  if (itemsError || !availableItems || availableItems.length === 0) {
    return NextResponse.json({ error: 'Stok untuk tier ini sedang kosong.' }, { status: 400 });
  }

  const picked = weightedRandomPick(availableItems);
  if (!picked) {
    return NextResponse.json({ error: 'Gagal memproses pool item.' }, { status: 500 });
  }

  // Klaim item secara atomik: hanya berhasil jika masih is_claimed=false saat ini
  // (mencegah dua user mendapat item yang sama pada race condition)
  const { data: claimedItem, error: claimError } = await service
    .from('gacha_account_items')
    .update({ is_claimed: true, claimed_by: userId, claimed_at: new Date().toISOString() })
    .eq('id', picked.id)
    .eq('is_claimed', false)
    .select('id, item_name, image_url')
    .single();

  if (claimError || !claimedItem) {
    return NextResponse.json({ error: 'Item baru saja diklaim pengguna lain, silakan coba lagi.' }, { status: 409 });
  }

  // Potong saldo & tambah hitungan gacha
  const newBalance = Number(profile.balance) - Number(tier.price);
  const newGachaCount = Number(profile.total_gacha_count) + 1;

  const { error: updateProfileError } = await service
    .from('profiles')
    .update({ balance: newBalance, total_gacha_count: newGachaCount })
    .eq('id', userId);

  if (updateProfileError) {
    // Rollback klaim item kalau update saldo gagal
    await service.from('gacha_account_items').update({ is_claimed: false, claimed_by: null, claimed_at: null }).eq('id', picked.id);
    return NextResponse.json({ error: 'Gagal memproses saldo. Transaksi dibatalkan.' }, { status: 500 });
  }

  // Catat transaksi untuk live feed & histori
  await service.from('gacha_transactions').insert({
    user_id: userId,
    gacha_type: 'account',
    tier_id: tierId,
    tier_name: tier.name,
    price_paid: tier.price,
    result_name: claimedItem.item_name,
    result_image_url: claimedItem.image_url,
  });

  return NextResponse.json({
    result: {
      itemName: claimedItem.item_name,
      imageUrl: claimedItem.image_url,
    },
    newBalance,
  });
}
