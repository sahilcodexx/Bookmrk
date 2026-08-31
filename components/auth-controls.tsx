"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthControls() {
  const router = useRouter();
  const { user, loaded, signInWithGoogle, signOut } = useAuth();

  if (!loaded) {
    return (
      <div
        aria-hidden
        className="inline-flex h-7 w-7 items-center justify-center rounded-full"
      />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={signInWithGoogle}
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-neutral-300 bg-transparent px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-neutral-400 hover:text-foreground dark:border-neutral-700 dark:hover:border-neutral-600"
      >
        <HugeiconsIcon
          icon={GoogleIcon}
          strokeWidth={2}
          className="size-3.5"
        />
        Sign in
      </button>
    );
  }

  const name = user.user_metadata?.full_name ?? user.email ?? "Account";
  const initial = (name?.[0] ?? "?").toUpperCase();
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  // Sign out from the browser client — it knows the exact cookie
  // attributes Supabase set (HttpOnly + SameSite=Lax + domain), so it
  // can clear them. A plain `<a href="/api/auth/signout">` from the
  // server can't match those attributes and the browser ignores the
  // delete.
  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 text-[0.625rem] font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          />
        }
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="size-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <div className="px-2 py-1.5 text-xs">
          <div className="font-medium text-foreground">{name}</div>
          {user.email && (
            <div className="truncate text-muted-foreground">{user.email}</div>
          )}
        </div>
        <DropdownMenuItem onClick={handleSignOut} className="text-xs">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
