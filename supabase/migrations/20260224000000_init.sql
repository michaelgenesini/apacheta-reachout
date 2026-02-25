-- ReachOut initial schema

-- Profiles table: one per user
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text not null,

  -- Form configuration
  form_title text not null default 'Get in touch',
  intro_message text,
  submit_label text not null default 'Send message',
  thankyou_message text not null default 'Thanks! I''ll get back to you soon.',
  destination_email text not null,
  privacy_url text,

  -- Usage tracking (no submission content ever stored)
  submission_count integer not null default 0,
  monthly_submission_count integer not null default 0,
  monthly_reset_at timestamptz not null default date_trunc('month', now()),

  -- Flags
  is_live boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Authenticated users can read/write their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Anyone can read profiles by username (needed for the public form page)
create policy "Public can read profiles by username"
  on public.profiles for select
  using (true);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if length(base_username) < 3 then
    base_username := base_username || 'user';
  end if;

  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles (id, username, email, destination_email)
  values (new.id, final_username, new.email, new.email);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Atomic submission counter with monthly reset
create or replace function public.increment_submission_count(profile_id uuid)
returns void as $$
declare
  prof record;
  current_month timestamptz := date_trunc('month', now());
begin
  select * into prof from public.profiles where id = profile_id;

  if prof.monthly_reset_at < current_month then
    update public.profiles
    set
      submission_count = submission_count + 1,
      monthly_submission_count = 1,
      monthly_reset_at = current_month,
      updated_at = now()
    where id = profile_id;
  else
    update public.profiles
    set
      submission_count = submission_count + 1,
      monthly_submission_count = monthly_submission_count + 1,
      updated_at = now()
    where id = profile_id;
  end if;
end;
$$ language plpgsql security definer;

grant execute on function public.increment_submission_count(uuid) to anon, authenticated, service_role;
