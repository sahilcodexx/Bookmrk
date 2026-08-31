// Data-access layer for bookmarks + custom tags.
//
// All functions take a Supabase client (the per-request, RLS-aware
// server client) and return plain data shapes. RLS does the user
// scoping — every query is automatically filtered to the caller's
// rows. The route handlers in `app/api/bookmarks/*` and
// `app/api/tags/*` are thin shells around these functions.

import type { SupabaseClient } from "@supabase/supabase-js";

export type BookmarkKind = "type" | "action";

export interface Bookmark {
  id: string;
  title: string;
  description: string | null;
  href: string;
  type: string;
  action: string;
  tags: string[];
  date: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface CustomTag {
  id: string;
  label: string;
  color: string;
  kind: BookmarkKind;
  created_at: string;
  user_id?: string;
}

export interface NewBookmark {
  title: string;
  href: string;
  tags: string[];
  description?: string;
}

export type BookmarkUpdate = Partial<NewBookmark>;

// ---------------------------------------------------------------------------
// bookmarks
// ---------------------------------------------------------------------------

export async function listBookmarks(
  supabase: SupabaseClient
): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listBookmarks: ${error.message}`);
  return (data ?? []) as Bookmark[];
}

export async function createBookmark(
  supabase: SupabaseClient,
  input: NewBookmark
): Promise<Bookmark> {
  const { type, action, tags, ...rest } = deriveTypeAndAction(input);
  const row = {
    ...rest,
    type,
    action,
    tags,
    date: formatToday(),
  };
  const { data, error } = await supabase
    .from("bookmarks")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`createBookmark: ${error.message}`);
  return data as Bookmark;
}

export async function updateBookmark(
  supabase: SupabaseClient,
  id: string,
  input: BookmarkUpdate
): Promise<Bookmark> {
  const { type, action, tags, ...rest } = input.tags
    ? deriveTypeAndAction(input as NewBookmark)
    : { type: undefined, action: undefined, tags: undefined, ...input };

  const patch: Record<string, unknown> = { ...rest };
  if (type !== undefined) patch.type = type;
  if (action !== undefined) patch.action = action;
  if (tags !== undefined) patch.tags = tags;

  const { data, error } = await supabase
    .from("bookmarks")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateBookmark: ${error.message}`);
  return data as Bookmark;
}

export async function deleteBookmark(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);
  if (error) throw new Error(`deleteBookmark: ${error.message}`);
}

export async function deleteBookmarks(
  supabase: SupabaseClient,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("bookmarks").delete().in("id", ids);
  if (error) throw new Error(`deleteBookmarks: ${error.message}`);
}

// ---------------------------------------------------------------------------
// custom_tags
// ---------------------------------------------------------------------------

export async function listCustomTags(
  supabase: SupabaseClient
): Promise<CustomTag[]> {
  const { data, error } = await supabase
    .from("custom_tags")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`listCustomTags: ${error.message}`);
  return (data ?? []) as CustomTag[];
}

export async function createCustomTag(
  supabase: SupabaseClient,
  input: { label: string; color: string; kind: BookmarkKind }
): Promise<CustomTag> {
  const { data, error } = await supabase
    .from("custom_tags")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`createCustomTag: ${error.message}`);
  return data as CustomTag;
}

export async function deleteCustomTag(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("custom_tags").delete().eq("id", id);
  if (error) throw new Error(`deleteCustomTag: ${error.message}`);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

// Match the "last tag wins" rule used by the client: walk the tag list
// right-to-left and pick the first one that's a type / action. Falls
// back to the first tag if neither matches, then to "Read" / "Use" as
// a final safety net.
function deriveTypeAndAction(input: NewBookmark) {
  const tags = input.tags ?? [];
  const reversed = [...tags].reverse();
  return {
    title: input.title,
    href: input.href,
    description: input.description ?? input.href,
    tags,
    type: reversed[0] ?? tags[0] ?? "Read",
    action: reversed[1] ?? tags[1] ?? "Use",
  };
}

function formatToday(): string {
  return new Date()
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "2-digit",
    })
    .toUpperCase()
    .replace(",", "")
    .replace(/(\w+) (\d+)/, "$1 $2,");
}
