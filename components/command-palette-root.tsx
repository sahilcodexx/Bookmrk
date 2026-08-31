"use client";
// Global Cmd/Ctrl+K command palette.
//
// Renders nothing when closed, and a CommandDialog when open. Owns the
// open state itself so any page (or shortcut) can summon it. Actions are
// intentionally simple — page-level handlers (Add Bookmark, theme toggle,
// clear filters, navigate home) without touching the bookmark data layer.

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useTheme } from "next-themes";
import {
  Home01Icon,
  PlusSignIcon,
  Search01Icon,
  Sun03Icon,
  Moon02Icon,
  FilterIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function CommandPaletteRoot() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // Cmd/Ctrl+K to toggle, Escape closes (built into CommandDialog).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === "k" || e.key === "K") &&
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey
      ) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);

    // External trigger (e.g. the navbar's search button) fires a custom
    // event so the palette can be summoned from anywhere without sharing
    // a state owner.
    const onOpen = () => setOpen(true);
    window.addEventListener("open-command-palette", onOpen);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  // On the bookmark page, the palette deep-links to the existing inputs
  // via custom events so we don't have to import all of the page state.
  const focusSearchInput = useCallback(() => {
    const el = document.querySelector<HTMLInputElement>(
      'input[placeholder^="Search here"]'
    );
    el?.focus();
    el?.select();
  }, []);

  const focusTagInput = useCallback(() => {
    const el = document.querySelector<HTMLInputElement>(
      'input[placeholder^="Search tags"]'
    );
    el?.focus();
  }, []);

  const openAddBookmark = useCallback(() => {
    if (pathname !== "/bookmark") {
      router.push("/bookmark?add=1");
      return;
    }
    // Trigger the Add Bookmark button by data attribute.
    document
      .querySelector<HTMLButtonElement>("[data-add-bookmark-trigger]")
      ?.click();
  }, [pathname, router]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const goHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // The palette is only useful on the bookmark page, but we still show
  // the global commands everywhere so the user can summon it anywhere.
  const onBookmarkPage = pathname === "/bookmark";

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search and run any command"
    >
      {/* The `CommandDialog` wrapper here just provides the Dialog
          chrome; cmdk still needs its root <Command> context above
          every <CommandInput>/<CommandList> pair, so we wrap the
          entire body explicitly. Both <CommandInput> and
          <CommandList> must be descendants of this <Command>. */}
      <CommandPrimitive
        // Re-key when (re)opening so each session starts from a clean
        // search value instead of restoring the last query.
        key={open ? "open" : "closed"}
        className="flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground"
        label="Command Palette"
        shouldFilter
      >
        <CommandInput placeholder="Type a command or search…" />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {onBookmarkPage && (
          <CommandGroup heading="Bookmarks">
            <CommandItem
              value="Add bookmark"
              onSelect={() => {
                setOpen(false);
                openAddBookmark();
              }}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              <span>Add bookmark</span>
              <CommandShortcut>{isMac ? "⌘N" : "Ctrl N"}</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="Focus search"
              onSelect={() => {
                setOpen(false);
                focusSearchInput();
              }}
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              <span>Focus search input</span>
              <CommandShortcut>/</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="Focus tag filter"
              onSelect={() => {
                setOpen(false);
                focusTagInput();
              }}
            >
              <HugeiconsIcon icon={FilterIcon} strokeWidth={2} />
              <span>Focus tag filter</span>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem
            value="Go home"
            onSelect={() => {
              setOpen(false);
              goHome();
            }}
          >
            <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
            <span>Go to home</span>
            <CommandShortcut>{isMac ? "⌘H" : "Ctrl H"}</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Theme">
          <CommandItem
            value="Toggle theme"
            onSelect={() => {
              setOpen(false);
              toggleTheme();
            }}
          >
            <HugeiconsIcon
              icon={resolvedTheme === "dark" ? Sun03Icon : Moon02Icon}
              strokeWidth={2}
            />
            <span>Toggle {resolvedTheme === "dark" ? "light" : "dark"} mode</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Other">
          <CommandItem
            value="Show hint"
            onSelect={() => {
              setOpen(false);
            }}
            disabled
          >
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
            <span>Press {isMac ? "⌘K" : "Ctrl K"} anywhere to open this</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      </CommandPrimitive>
    </CommandDialog>
  );
}
