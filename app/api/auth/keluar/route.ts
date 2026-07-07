import { createClient } from '@/app/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}
