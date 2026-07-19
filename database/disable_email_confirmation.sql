-- ============================================================
-- OPSIONAL: Nonaktifkan email confirmation (mode development)
-- Jalankan di Supabase SQL Editor jika ingin langsung login
-- tanpa perlu konfirmasi email
-- ============================================================

-- Cara alternatif via Dashboard:
-- Authentication → Settings → Email Confirmations → OFF

-- Atau via SQL (nonaktifkan untuk semua user baru):
update auth.config 
set enable_signup = true;

-- Konfirmasi semua user yang sudah ada secara manual:
update auth.users 
set email_confirmed_at = now()
where email_confirmed_at is null;
