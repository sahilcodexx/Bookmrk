-- 0001_init.sql — initial schema for Bookmrkly.
--
-- Run via: `supabase db push` (with `supabase` CLI configured) or paste
-- into the Supabase SQL editor. Idempotent within a single migration:
-- re-running it on an already-bootstrapped project is a no-op.

-- ---------------------------------------------------------------------------
-- bookmarks
-- ---------------------------------------------------------------------------
-- A saved link. `tags` is a denormalized text[] so the existing client
-- logic (which treats tags as a flat string array) keeps working without
-- a join table. `type` and `action` are derived from `tags` on insert
-- (last-tag-wins rule) but stored here too for fast filtering.
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  href        text        not null,
  type        text        not null,
  action      text        not null,
  tags        text[]      not null default '{}',
  date        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists bookmarks_created_at_idx
  on public.bookmarks (created_at desc);

create index if not exists bookmarks_type_idx
  on public.bookmarks (type);

create index if not exists bookmarks_action_idx
  on public.bookmarks (action);

-- Auto-bump `updated_at` on every UPDATE.
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookmarks_set_updated_at on public.bookmarks;
create trigger bookmarks_set_updated_at
  before update on public.bookmarks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- custom_tags
-- ---------------------------------------------------------------------------
-- User-defined types and actions beyond the built-in palette. Built-in
-- tags (Read / Watch / Listen / Use / Build / Learn / Join / Follow /
-- Apply / Browse) live in code, not in this table, so we don't have to
-- seed them on every fresh project.
create table if not exists public.custom_tags (
  id         uuid primary key default gen_random_uuid(),
  label      text        not null,
  color      text        not null,
  kind       text        not null check (kind in ('type', 'action')),
  created_at timestamptz not null default now(),
  unique (label, kind)
);

create index if not exists custom_tags_kind_idx
  on public.custom_tags (kind);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- For now the project doesn't have auth, so we leave the tables open
-- (service role key bypasses RLS anyway). When auth lands, tighten the
-- policies below to scope rows to `auth.uid()`.
alter table public.bookmarks   enable row level security;
alter table public.custom_tags enable row level security;

drop policy if exists "anon read bookmarks"   on public.bookmarks;
drop policy if exists "anon write bookmarks"  on public.bookmarks;
drop policy if exists "anon read custom_tags" on public.custom_tags;
drop policy if exists "anon write custom_tags" on public.custom_tags;

create policy "anon read bookmarks"
  on public.bookmarks for select
  using (true);

create policy "anon write bookmarks"
  on public.bookmarks for all
  using (true)
  with check (true);

create policy "anon read custom_tags"
  on public.custom_tags for select
  using (true);

create policy "anon write custom_tags"
  on public.custom_tags for all
  using (true)
  with check (true);
