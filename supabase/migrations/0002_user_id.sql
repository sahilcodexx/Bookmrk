-- 0002_user_id.sql — per-user scoping for bookmarks + custom tags.
--
-- 1. Adds a `user_id` column to both tables, referencing `auth.users`.
-- 2. Wipes the rows seeded by 0001_init (they were fixtures, not tied
--    to a real user).
-- 3. Replaces the open "anon" RLS policies with policies that scope
--    every read/write to the row's owner. The service-role key still
--    bypasses RLS, but the API routes will be migrated to use the
--    per-request user client, so all client-visible traffic is now
--    user-scoped.

-- ---------------------------------------------------------------------------
-- bookmarks
-- ---------------------------------------------------------------------------
alter table public.bookmarks
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists bookmarks_user_id_idx
  on public.bookmarks (user_id);

-- Wipe seeded fixtures (no user_id, would be invisible after RLS).
delete from public.bookmarks where user_id is null;

-- Default new rows to the signed-in user, so the client never has to
-- pass `user_id` explicitly.
alter table public.bookmarks
  alter column user_id set default auth.uid();

-- ---------------------------------------------------------------------------
-- custom_tags
-- ---------------------------------------------------------------------------
alter table public.custom_tags
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists custom_tags_user_id_idx
  on public.custom_tags (user_id);

delete from public.custom_tags where user_id is null;

alter table public.custom_tags
  alter column user_id set default auth.uid();

-- ---------------------------------------------------------------------------
-- RLS — replace the open "anon" policies with per-user policies.
-- ---------------------------------------------------------------------------
drop policy if exists "anon read bookmarks"   on public.bookmarks;
drop policy if exists "anon write bookmarks"  on public.bookmarks;
drop policy if exists "anon read custom_tags" on public.custom_tags;
drop policy if exists "anon write custom_tags" on public.custom_tags;

create policy "Users read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users update own bookmarks"
  on public.bookmarks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

create policy "Users read own custom_tags"
  on public.custom_tags for select
  using (auth.uid() = user_id);

create policy "Users insert own custom_tags"
  on public.custom_tags for insert
  with check (auth.uid() = user_id);

create policy "Users update own custom_tags"
  on public.custom_tags for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own custom_tags"
  on public.custom_tags for delete
  using (auth.uid() = user_id);
