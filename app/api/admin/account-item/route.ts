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
    return NextResponse.json({ error: 'Hanya admin yang bisa menambah item.' }, { status: 403 });
  }

  const { tierId, itemName, chance, credentials } = await req.json();

  if (!tierId || !itemName || chance === undefined || !credentials?.email || !credentials?.password) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  const service = createServiceClient();

  // Validasi total chance di tier ini tidak melebihi 100%
  const { data: existingItems } = await service
    .from('gacha_account_items')
    .select('chance')
    .eq('tier_id', tierId);

  const currentTotal = (existingItems ?? []).reduce((sum, i) => sum + Number(i.chance), 0);
  if (currentTotal + Number(chance) > 100) {
    return NextResponse.json(
      { error: `Total chance akan menjadi ${(currentTotal + Number(chance)).toFixed(1)}%, melebihi 100%.` },
      { status: 400 }
    );
  }

  const encrypted = encryptCredentials(credentials);

  const { data: newItem, error } = await service
    .from('gacha_account_items')
    .insert({
      tier_id: tierId,
      item_name: itemName,
      chance: Number(chance),
      credentials_encrypted: encrypted,
    })
    .select('id, tier_id, item_name, image_url, chance, is_claimed')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Gagal menyimpan item: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ item: newItem });
}
