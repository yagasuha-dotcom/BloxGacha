import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase-server';
import { createServiceClient } from '@/app/lib/supabase-server';
import { encryptCredentials } from '@/app/lib/crypto';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return NextResponse.json({ error: 'Belum login.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya admin yang bisa menambah listing.' }, { status: 403 });
  }

  const { gameId, title, description, price, images, credentials } = await req.json();

  if (!gameId || !title || !price || !credentials?.email || !credentials?.password) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  const service = createServiceClient();
  const encrypted = encryptCredentials(credentials);

  const { data: listing, error } = await service
    .from('marketplace_listings')
    .insert({
      game_id: gameId,
      title,
      description: description || null,
      price: Number(price),
      images: images ?? [],
      credentials_encrypted: encrypted,
      status: 'available',
    })
    .select('id, game_id, title, description, price, images, status, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Gagal menyimpan listing: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ listing });
}
