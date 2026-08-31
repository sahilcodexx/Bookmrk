"use client";
// useAuth — client-side session + sign-in helpers.
//
// The session comes from the Supabase browser client (cookies), which
// is updated by Supabase's own auth listeners. We expose the user
// object + a signInWithGoogle helper + a signOut helper.

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabaseBrowser) {
      setLoaded(true);
      return;
    }

    let cancelled = false;
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user);
      setLoaded(true);
    });

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        setUser(session?.user ?? null);
        setLoaded(true);
      }
    );

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loaded,
    isSignedIn: !!user,
    signInWithGoogle: async () => {
      if (!supabaseBrowser) return;
      await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/bookmark`,
        },
      });
    },
    signOut: async () => {
      if (!supabaseBrowser) return;
      await supabaseBrowser.auth.signOut();
    },
  };
}
