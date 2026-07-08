import { createClient } from '@/app/lib/supabase-server';
import PaymentMethodManager from './PaymentMethodManager';
import type { PaymentMethod } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentMethodsPage() {
  const supabase = createClient();
  const { data: methods } = await supabase.from('payment_methods').select('*').order('sort_order');

  return <PaymentMethodManager initialMethods={(methods as PaymentMethod[]) ?? []} />;
}
