-- Add slug: the public-facing URL handle, editable by the user.
-- username stays immutable (derived from email, used internally).
-- slug starts equal to username but can be customised.

alter table public.profiles
  add column slug text unique not null default '';

-- Populate existing rows (dev only — production starts fresh)
update public.profiles set slug = username where slug = '';

-- Add a check: slug must be lowercase alphanumeric + hyphens, 3-40 chars
alter table public.profiles
  add constraint slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$');

-- Add default_privacy_policy column to track whether the privacy URL
-- is our generated one (so dashboard can show the right hint)
alter table public.profiles
  add column using_default_privacy boolean not null default false;

-- Update the new-user trigger to:
-- 1. Set slug = username
-- 2. Set privacy_url to the auto-generated policy page
-- 3. Set is_live = true immediately
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
  generated_url text;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if length(base_username) < 3 then
    base_username := base_username || 'user';
  end if;
  -- Truncate to 38 chars so slug constraint (max 40 with padding) is satisfied
  if length(base_username) > 38 then
    base_username := substr(base_username, 1, 38);
  end if;

  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  -- The privacy URL points to our hosted default policy page, keyed by slug
  generated_url := 'http://localhost:3000/privacy/' || final_username;

  insert into public.profiles (
    id,
    username,
    slug,
    email,
    destination_email,
    privacy_url,
    using_default_privacy,
    is_live
  )
  values (
    new.id,
    final_username,
    final_username,
    new.email,
    new.email,
    generated_url,
    true,
    true
  );

  return new;
end;
$$ language plpgsql security definer;
