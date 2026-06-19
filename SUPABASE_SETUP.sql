-- ============================================================================
-- OneMLLab blog — Supabase setup
-- Run this ONCE in the Supabase dashboard:  SQL Editor  ->  New query  ->  paste
-- all of this  ->  Run.
--
-- It creates the posts table, the image storage bucket, and security rules so
-- that ANYONE can read your posts but ONLY YOU can write them.
--
-- If your login email is not the one below, change OWNER_EMAIL in BOTH places.
-- ============================================================================

-- 1. Posts table -------------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  excerpt     text not null default '',
  body        text not null default '',
  post_date   date not null default current_date,
  author      text not null default 'Kazi Rahman',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- 2. Row Level Security ------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts
  for select using (true);

drop policy if exists "posts owner write" on public.posts;
create policy "posts owner write" on public.posts
  for all
  using      ((auth.jwt() ->> 'email') = 'kazif2122r@gmail.com')   -- OWNER_EMAIL
  with check ((auth.jwt() ->> 'email') = 'kazif2122r@gmail.com');  -- OWNER_EMAIL

-- 3. Image storage bucket ----------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "images public read" on storage.objects;
create policy "images public read" on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists "images owner write" on storage.objects;
create policy "images owner write" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and (auth.jwt() ->> 'email') = 'kazif2122r@gmail.com'  -- OWNER_EMAIL
  );

drop policy if exists "images owner update" on storage.objects;
create policy "images owner update" on storage.objects
  for update using (
    bucket_id = 'post-images'
    and (auth.jwt() ->> 'email') = 'kazif2122r@gmail.com'  -- OWNER_EMAIL
  );

drop policy if exists "images owner delete" on storage.objects;
create policy "images owner delete" on storage.objects
  for delete using (
    bucket_id = 'post-images'
    and (auth.jwt() ->> 'email') = 'kazif2122r@gmail.com'  -- OWNER_EMAIL
  );
