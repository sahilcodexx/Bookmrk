"use client";
// useBookmarks — client-side data layer for the bookmark page.
//
// Wraps the /api/bookmarks + /api/tags endpoints in a single hook so
// the page can `useBookmarks()` and get back a stable list of bookmarks
// + helpers to add / update / delete. State lives in this hook (not
// the page) so the API calls have a single source of truth.
//
// Optimistic updates: every mutation patches the local state first, then
// fires the network request. If the request fails, the change is
// reverted and a toast is shown. Keeps the UI snappy even on slow
// networks.

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { supabaseBrowser } from "@/lib/supabase/client";

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
}

export interface CustomTag {
  id: string;
  label: string;
  color: string;
  kind: BookmarkKind;
  created_at: string;
}

export interface NewBookmark {
  title: string;
  href: string;
  tags: string[];
  description?: string;
}

export type BookmarkUpdate = Partial<NewBookmark>;

const BOOKMARKS_FALLBACK: Bookmark[] = [];

/** Check the browser's current Supabase session, if any. Returns null when
 *  the user is signed out. */
async function getCurrentUserId(): Promise<string | null> {
  if (!supabaseBrowser) return null;
  const { data } = await supabaseBrowser.auth.getUser();
  return data.user?.id ?? null;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(BOOKMARKS_FALLBACK);
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initial fetch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bRes, tRes] = await Promise.all([
          fetch("/api/bookmarks", { cache: "no-store" }),
          fetch("/api/tags", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (!bRes.ok) {
          throw new Error(`/api/bookmarks → ${bRes.status}`);
        }
        if (!tRes.ok) {
          throw new Error(`/api/tags → ${tRes.status}`);
        }
        const [bJson, tJson] = await Promise.all([bRes.json(), tRes.json()]);
        if (cancelled) return;
        setBookmarks(bJson.bookmarks ?? []);
        setCustomTags(tJson.tags ?? []);
        if (typeof window !== "undefined") {
          console.info(
            "[useBookmarks] loaded",
            bJson.bookmarks?.length,
            "bookmarks",
            tJson.tags?.length,
            "custom tags"
          );
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[useBookmarks] load failed:", err);
        toast.add({
          type: "error",
          title: "Couldn't load bookmarks",
          description: err instanceof Error ? err.message : undefined,
        });
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------ bookmarks ------------------

  const addBookmark = useCallback(async (input: NewBookmark) => {
    if (!(await getCurrentUserId())) {
      toast.add({
        type: "info",
        title: "Sign in to save bookmarks",
        description: "Your bookmarks need a Google account to persist.",
      });
      throw new Error("not signed in");
    }
    const optimistic: Bookmark = {
      id: `temp-${Date.now()}`,
      title: input.title,
      description: input.description ?? input.href,
      href: input.href,
      type: input.tags[input.tags.length - 1] ?? "Read",
      action: input.tags[input.tags.length - 2] ?? "Use",
      tags: input.tags,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "2-digit",
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBookmarks((prev) => [optimistic, ...prev]);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { bookmark } = (await res.json()) as { bookmark: Bookmark };
      setBookmarks((prev) =>
        prev.map((b) => (b.id === optimistic.id ? bookmark : b))
      );
      return bookmark;
    } catch (err) {
      // Roll back.
      setBookmarks((prev) => prev.filter((b) => b.id !== optimistic.id));
      toast.add({
        type: "error",
        title: "Couldn't add bookmark",
        description: err instanceof Error ? err.message : undefined,
      });
      throw err;
    }
  }, []);

  const updateBookmark = useCallback(
    async (id: string, input: BookmarkUpdate) => {
      if (!(await getCurrentUserId())) {
        toast.add({
          type: "info",
          title: "Sign in to update bookmarks",
          description: "Your bookmarks need a Google account.",
        });
        throw new Error("not signed in");
      }
      const before = bookmarks.find((b) => b.id === id);
      if (!before) return;
      const next: Bookmark = {
        ...before,
        ...input,
        description: input.description ?? input.href ?? before.description,
        href: input.href ?? before.href,
        title: input.title ?? before.title,
        tags: input.tags ?? before.tags,
        type: input.tags
          ? input.tags[input.tags.length - 1] ?? before.type
          : before.type,
        action: input.tags
          ? input.tags[input.tags.length - 2] ?? before.action
          : before.action,
      };
      setBookmarks((prev) => prev.map((b) => (b.id === id ? next : b)));
      try {
        const res = await fetch(`/api/bookmarks/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { bookmark } = (await res.json()) as { bookmark: Bookmark };
        setBookmarks((prev) =>
          prev.map((b) => (b.id === id ? bookmark : b))
        );
        return bookmark;
      } catch (err) {
        // Revert.
        setBookmarks((prev) => prev.map((b) => (b.id === id ? before : b)));
        toast.add({
          type: "error",
          title: "Couldn't update bookmark",
          description: err instanceof Error ? err.message : undefined,
        });
        throw err;
      }
    },
    [bookmarks]
  );

  const deleteBookmark = useCallback(async (id: string) => {
    if (!(await getCurrentUserId())) {
      toast.add({
        type: "info",
        title: "Sign in to delete bookmarks",
        description: "Your bookmarks need a Google account.",
      });
      throw new Error("not signed in");
    }
    const before = bookmarks.find((b) => b.id === id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      // Restore on failure.
      if (before) setBookmarks((prev) => [before, ...prev]);
      toast.add({
        type: "error",
        title: "Couldn't delete bookmark",
        description: err instanceof Error ? err.message : undefined,
      });
      throw err;
    }
  }, [bookmarks]);

  const deleteBookmarksBulk = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      if (!(await getCurrentUserId())) {
        toast.add({
          type: "info",
          title: "Sign in to delete bookmarks",
          description: "Your bookmarks need a Google account.",
        });
        throw new Error("not signed in");
      }
      const removed = bookmarks.filter((b) => ids.includes(b.id));
      setBookmarks((prev) => prev.filter((b) => !ids.includes(b.id)));
      try {
        const res = await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        // Restore on failure.
        setBookmarks((prev) => [...removed, ...prev]);
        toast.add({
          type: "error",
          title: "Couldn't delete bookmarks",
          description: err instanceof Error ? err.message : undefined,
        });
        throw err;
      }
    },
    [bookmarks]
  );

  // ------------------ custom tags ------------------

  const addCustomTag = useCallback(
    async (input: { label: string; color: string; kind: BookmarkKind }) => {
      if (!(await getCurrentUserId())) {
        toast.add({
          type: "info",
          title: "Sign in to create tags",
          description: "Your tags need a Google account to persist.",
        });
        throw new Error("not signed in");
      }
      try {
        const res = await fetch("/api/tags", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { tag } = (await res.json()) as { tag: CustomTag };
        setCustomTags((prev) => [...prev, tag]);
        return tag;
      } catch (err) {
        toast.add({
          type: "error",
          title: "Couldn't add tag",
          description: err instanceof Error ? err.message : undefined,
        });
        throw err;
      }
    },
    []
  );

  const deleteCustomTag = useCallback(async (id: string) => {
    if (!(await getCurrentUserId())) {
      toast.add({
        type: "info",
        title: "Sign in to delete tags",
        description: "Your tags need a Google account.",
      });
      throw new Error("not signed in");
    }
    const before = customTags.find((t) => t.id === id);
    setCustomTags((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch("/api/tags", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (before) setCustomTags((prev) => [...prev, before]);
      toast.add({
        type: "error",
        title: "Couldn't delete tag",
        description: err instanceof Error ? err.message : undefined,
      });
      throw err;
    }
  }, [customTags]);

  return {
    bookmarks,
    customTags,
    loaded,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    deleteBookmarksBulk,
    addCustomTag,
    deleteCustomTag,
  };
}
