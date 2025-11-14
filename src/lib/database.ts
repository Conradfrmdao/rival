import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

let supabaseClient: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing');
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
  return supabaseClient;
};