import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wtlsjxrajaxrdvdicpov.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bHNqeHJhamF4cmR2ZGljcG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzMwNzIsImV4cCI6MjA5MzQwOTA3Mn0.oG4kdqlXvEXTY4_joapl25q_uAa5nDsXnCOwjQzS0Q8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
