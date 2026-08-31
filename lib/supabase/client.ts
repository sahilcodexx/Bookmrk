// Browser-side Supabase client.
//
// Uses `createBrowserClient` from `@supabase/ssr` (NOT the raw
// `createClient` from `@supabase/supabase-js`). The SSR variant stores
// the session in **cookies**, which the server-side
// `getServerClient()` also reads — so the same session is visible to
// both sides. With the raw `createClient` the session is kept in
// `localStorage` only, and the server never sees the user, which
// silently breaks RLS for every API route.
//
// `getAll` / `setAll` are left unconfigured because `@supabase/ssr`
// handles them automatically via `document.cookie`.

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cookie-backed Supabase client. Safe in the browser. Respects RLS,
 * so once auth lands, the same queries will automatically scope to
 * the signed-in user — and the server's `getServerClient()` will see
 * the matching session because both sides read the same cookies.
 */
export const supabaseBrowser =
  url && anonKey ? createBrowserClient(url, anonKey) : null;
