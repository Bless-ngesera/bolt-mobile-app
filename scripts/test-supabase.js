#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment (.env).');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  try {
    const { data, error } = await supabase.from('faculties').select('id').limit(1);
    if (error) {
      console.error('Query error:', error.message || error);
      process.exit(2);
    }
    console.log('Supabase connection OK — faculties rows found:', (data || []).length);
    process.exit(0);
  } catch (err) {
    console.error('Connection test failed:', err.message || err);
    process.exit(3);
  }
})();
