export type Game = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  color_theme: string;
  is_active: boolean;
  sort_order: number;
};

export type GachaAccountTier = {
  id: string;
  game_id: string;
  name: string;
  price: number;
  profile_badge: string | null;
  banner_image_url: string | null;
  is_active: boolean;
};

export type GachaAccountItem = {
  id: string;
  tier_id: string;
  item_name: string;
  image_url: string | null;
  chance: number;
  is_claimed: boolean;
};

export type GachaCurrencyTier = {
  id: string;
  game_id: string;
  name: string;
  currency_label: string;
  price: number;
  banner_image_url: string | null;
  is_active: boolean;
};

export type GachaCurrencyRange = {
  id: string;
  tier_id: string;
  min_amount: number;
  max_amount: number;
  chance: number;
};

export type GachaBoxTier = {
  id: string;
  game_id: string | null;
  name: string;
  price: number;
  banner_image_url: string | null;
  is_active: boolean;
};

export type GachaBoxItem = {
  id: string;
  tier_id: string;
  item_name: string;
  image_url: string | null;
  chance: number;
  stock: number;
  is_active: boolean;
};

export type MarketplaceListing = {
  id: string;
  game_id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
  status: 'available' | 'sold' | 'hidden';
  created_at: string;
};

export type GachaTransaction = {
  id: string;
  user_id: string;
  gacha_type: 'account' | 'currency' | 'box';
  tier_name: string;
  price_paid: number;
  result_name: string;
  result_image_url: string | null;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
};

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  balance: number;
  role: 'user' | 'admin';
  total_gacha_count: number;
};

export type TopupRequest = {
  id: string;
  user_id: string;
  amount: number;
  unique_code: string;
  proof_image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  profiles?: { username: string };
};
