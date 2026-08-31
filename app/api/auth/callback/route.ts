// OAuth callback — Supabase redirects here after a successful Google
// sign-in.
//
// PKCE flow with `@supabase/ssr`:
//   1. Browser calls `signInWithOAuth` → redirected to Supabase
//   2. Supabase handles the OAuth dance with Google
//   3. Supabase redirects here with `?code=…` (NO session yet)
//   4. We call `exchangeCodeForSession(code)` — this validates the
//      code with Supabase and returns the session. The
//      `createServerClient` `setAll` hook then writes the session
//      cookies on the response so the browser stores them.
//   5. We 302 to the `next` page. From now on, every request the
//      browser makes to our server includes the auth cookies, and
//      `getServerClient()` can extract the user for RLS.
//
// We must NOT skip step 4 — without it, no cookies are ever set, the
// browser stays "signed in" only in localStorage, and the server's
// `auth.uid()` is always NULL, which silently breaks every RLS write.

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/bookmark";

  if (code) {
    const supabase = await getServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession failed:", error);
      // Fall through to the redirect anyway — the user will land on
      // /bookmark and `useAuth` will surface the missing session.
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
