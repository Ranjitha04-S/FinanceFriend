import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
// Locked to the device's current date: there is no way to change it in the UI.
export const today = () => new Date().toLocaleDateString('en-CA');
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
