-- ReachOut seed data for local development
-- Auto-runs on `npm run db:reset`.
-- Creates a test user and live form at /to/testuser.
--
-- Auth: passwordless (magic link). To sign in locally:
--   1. Go to /auth and enter test@example.com
--   2. Open Inbucket at http://localhost:54324 to get the link

-- Step 1: fake auth user (email_confirmed_at set so magic link works immediately)
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
)
values (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  crypt('devpassword123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}',
  'authenticated', 'authenticated'
)
on conflict (id) do nothing;

-- Step 2: upsert profile with all new columns
-- The trigger already ran (from auth.users insert above), so we upsert.
insert into public.profiles (
  id, username, slug, email,
  form_title, intro_message, submit_label, thankyou_message,
  destination_email, privacy_url, using_default_privacy,
  form_primary_color, form_bg_color,
  submission_count, monthly_submission_count, is_live
)
values (
  '00000000-0000-0000-0000-000000000001',
  'testuser', 'testuser', 'test@example.com',
  'Get in touch with Test User',
  'This is a seed profile for local development.',
  'Send message',
  'Thanks! This was a test submission.',
  'test@example.com',
  'http://localhost:3000/privacy/testuser',
  true,
  '#0c7b5f', '#fffcf1',
  0, 0, true
)
on conflict (id) do update set
  username            = excluded.username,
  slug                = excluded.slug,
  form_title          = excluded.form_title,
  intro_message       = excluded.intro_message,
  submit_label        = excluded.submit_label,
  thankyou_message    = excluded.thankyou_message,
  destination_email   = excluded.destination_email,
  privacy_url         = excluded.privacy_url,
  using_default_privacy = excluded.using_default_privacy,
  form_primary_color  = excluded.form_primary_color,
  form_bg_color       = excluded.form_bg_color,
  is_live             = excluded.is_live;
