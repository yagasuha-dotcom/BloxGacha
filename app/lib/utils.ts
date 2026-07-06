export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatDateTime(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function generateUniqueCode(): string {
  // Kode unik pendek untuk dicantumkan user di keterangan transfer
  return 'BG' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function rarityFromChance(chance: number): 'common' | 'rare' | 'epic' | 'legendary' {
  if (chance <= 5) return 'legendary';
  if (chance <= 20) return 'epic';
  if (chance <= 50) return 'rare';
  return 'common';
}
