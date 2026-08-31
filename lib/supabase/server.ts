// Server-side Supabase clients.
//
// Two clients:
//   - `supabaseAdmin` — service-role, bypasses RLS. Server-only, for
//     scripts / migrations / tasks that need full access. Backed by a
//     Proxy so the env-var check is deferred until the client is
//     actually used. This lets `next build` succeed on Vercel even
//     before the env vars are configured (the build only needs to
//     type-check the module, not instantiate the client).
//   - `getServerClient` — per-request, uses the user's session cookies
//     via `@supabase/ssr`. Respects RLS so each request only sees the
//     rows the signed-in user owns. Use this in every API route /
//     server component that handles user data.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _adminClient: SupabaseClient | null = null;
function getAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
    );
  }
  _adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}

/**
 * Service-role client. Bypasses RLS. Server-only.
 *
 * Exposed as a Proxy so the underlying `createClient` call (and the
 * env-var check it depends on) is deferred until the first method
 * call. This keeps `next build` happy when the env vars aren't
 * present yet — the module can be evaluated without throwing, and
 * only runtime usage of `supabaseAdmin.from(...)` triggers the check.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getAdminClient(), prop, getAdminClient());
  },
}) as SupabaseClient;

/**
 * Per-request Supabase client bound to the caller's session cookies.
 * Use this in any route handler / server component that needs to
 * respect the signed-in user's identity.
 */
export async function getServerClient() {
  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.");
  }
  const cookieStore = await cookies();
  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `set` is a no-op in Server Components (read-only context).
          // Safe to ignore; the actual cookie write happens in the
          // route handler.
        }
      },
    },
  });
}
