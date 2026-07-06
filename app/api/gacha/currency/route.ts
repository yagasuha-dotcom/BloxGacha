import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/app/lib/supabase-server';
import { weightedRandomPick, randomInRange } from '@/app/lib/gacha-random';

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

  const { data: tier, error: tierError } = await service
    .from('gacha_currency_tiers')
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

  const { data: ranges, error: rangesError } = await service
    .from('gacha_currency_ranges')
    .select('id, min_amount, max_amount, chance')
    .eq('tier_id', tierId);

  if (rangesError || !ranges || ranges.length === 0) {
    return NextResponse.json({ error: 'Tier ini belum memiliki konfigurasi hasil.' }, { status: 400 });
  }

  const pickedRange = weightedRandomPick(ranges);
  if (!pickedRange) {
    return NextResponse.json({ error: 'Gagal memproses range hasil.' }, { status: 500 });
  }

  const resultAmount = randomInRange(pickedRange.min_amount, pickedRange.max_amount);
  const resultName = `${resultAmount} ${tier.currency_label}`;

  const newBalance = Number(profile.balance) - Number(tier.price);
  const newGachaCount = Number(profile.total_gacha_count) + 1;

  const { error: updateProfileError } = await service
    .from('profiles')
    .update({ balance: newBalance, total_gacha_count: newGachaCount })
    .eq('id', userId);

  if (updateProfileError) {
    return NextResponse.json({ error: 'Gagal memproses saldo. Transaksi dibatalkan.' }, { status: 500 });
  }

  await service.from('gacha_transactions').insert({
    user_id: userId,
    gacha_type: 'currency',
    tier_id: tierId,
    tier_name: tier.name,
    price_paid: tier.price,
    result_name: resultName,
    result_image_url: null,
  });

  return NextResponse.json({
    result: { itemName: resultName, amount: resultAmount },
    newBalance,
  });
}
