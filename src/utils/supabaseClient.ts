import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kagoxcvsluzalisjqnif.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ294Y3ZzbHV6YWxpc2pxbmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjM3NTksImV4cCI6MjA3NTEzOTc1OX0.g3f0IosTYKac2sIqJZpiC4iTuDUWha3FuVhvIY2_RZ4'  // 使用你提供的正確 anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

