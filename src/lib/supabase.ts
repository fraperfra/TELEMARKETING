import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any;

export const handleSupabaseError = (error: any, message: string) => {
  if (error) {
    console.error(`[Supabase Error] ${message}:`, error.message);
    return true;
  }
  return false;
};
