// Sign out — clears the Supabase session cookies and redirects home.
//
// The Supabase browser client also clears the cookies on its end via
// `signOut()`, but that lives in the user's browser and doesn't
// affect the server-rendered pages. The route below explicitly deletes
// the auth cookies on the server so the next page load (e.g. hitting
// `/` or `/bookmark`) sees the user as signed out.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerClient } from "@/lib/supabase/server";

const COOKIE_NAMES = [
  "sb-mmdvrkaxlkdrtuhdghng-auth-token",
  // Older / chunked cookie variants Supabase has used historically.
  "sb-mmdvrkaxlkdrtuhdghng-auth-token-code-verifier",
];

async function signOutAndRedirect(request: Request) {
  const cookieStore = await cookies();

  // Tell Supabase to revoke the session server-side. `setAll` in the
  // server client will expire the cookies via `cookies().set(..., { maxAge: 0 })`,
  // but we ALSO delete them by name below to be sure (some Supabase
  // versions split the token across multiple cookie names).
  try {
    const supabase = await getServerClient();
    await supabase.auth.signOut();
  } catch {
    // Even if the Supabase call fails, the user wants to be signed out
    // locally — proceed with cookie deletion.
  }

  for (const name of COOKIE_NAMES) {
    try {
      cookieStore.delete(name);
    } catch {
      // ignore — cookie may not exist
    }
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}
