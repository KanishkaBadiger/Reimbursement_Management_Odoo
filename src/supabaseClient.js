import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yntzmrylftskdrppstym.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludHptcnlsZnRza2RycHBzdHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjI3NTEsImV4cCI6MjA5MDMzODc1MX0.n1GD9Feaa7LCki0wOEUoXJGVfltUidofHD-_gPR3_3Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
