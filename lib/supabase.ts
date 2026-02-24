import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client if environment variables are present.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
	SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export async function testConnection(): Promise<boolean> {
	if (!supabase) return false;
	const { data, error } = await supabase.from('faculties').select('id').limit(1);
	if (error) throw error;
	return true;
}
