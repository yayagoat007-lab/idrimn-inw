import { supabase } from '../lib/supabase';

/**
 * Accesses the client-side Supabase client for performing database operations.
 */
export function useSupabase() {
  return { supabase };
}
