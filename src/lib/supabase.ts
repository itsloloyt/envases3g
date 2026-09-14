import { createClient } from "@supabase/supabase-js";
import config from '@/data/supabase-config.json';
export function database() {
  const url = process.env.SUPABASE_URL || config.url;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || config.publishableKey;
  return url && key
    ? createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
}
