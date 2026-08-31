"use client";
// Pill button in the navbar that opens the global command palette.
// Dispatches a `open-command-palette` CustomEvent on `window`; the
// palette listens for it and flips its `open` state. Keeps the trigger
// and palette decoupled — neither imports the other.

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

interface CommandPaletteTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CommandPaletteTrigger = React.forwardRef<
  HTMLButtonElement,
  CommandPaletteTriggerProps
>(function CommandPaletteTrigger({ className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Open command palette"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("open-command-palette"))
      }
      className={cn(
        // The kbd-pill look from the reference: dark surface, subtle
        // border, search icon on the left, two kbd-style chips on the
        // right with a visible gap between them (Ctrl / K).
        "group/kbd inline-flex h-7 items-center gap-3 rounded-full border border-neutral-300 bg-transparent px-2.5 text-xs text-muted-foreground transition-colors hover:border-neutral-400 hover:text-foreground dark:border-neutral-700 dark:hover:border-neutral-600",
        className,
      )}
      {...rest}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={2}
        className="size-3.5 shrink-0"
      />
      <span
        aria-hidden
        className="hidden items-center gap-2 sm:inline-flex"
      >
        <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 font-mono text-[0.625rem] font-medium text-muted-foreground dark:border-neutral-700 dark:bg-neutral-800/60">
          {isMac ? "⌘" : "Ctrl"}
        </kbd>
        <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 font-mono text-[0.625rem] font-medium text-muted-foreground dark:border-neutral-700 dark:bg-neutral-800/60">
          K
        </kbd>
      </span>
    </button>
  );
});
