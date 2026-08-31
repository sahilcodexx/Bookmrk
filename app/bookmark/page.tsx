"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/container";
import { BlinkingGrid } from "@/components/ui/blinking-grid";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, X, Tag, Trash2, Check, Pencil, Home } from "lucide-react";
import { MultipleSelect } from "@/components/ui/multiple-select";
import { toast } from "@/components/ui/toast";
import {
  useBookmarks,
  type Bookmark as ApiBookmark,
  type CustomTag as ApiCustomTag,
} from "@/lib/hooks/use-bookmarks";
import {
  Dock,
  DockItem,
  DockSeparator,
} from "@/components/motion/dock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip } from "@/components/motion/tooltip";

type BookmarkType = string;
type BookmarkAction = string;

interface BookmarkItem {
  id: string;
  title: string;
  description: string;
  type: BookmarkType;
  action: BookmarkAction;
  date: string;
  href: string;
}

const TYPE_PALETTE: Record<string, string> = {
  Read: "bg-pink-400",
  Watch: "bg-purple-400",
  Listen: "bg-sky-400",
  Browse: "bg-orange-400",
};

const ACTION_PALETTE: Record<string, string> = {
  Use: "bg-blue-400",
  Build: "bg-orange-400",
  Learn: "bg-emerald-400",
  Join: "bg-green-400",
  Follow: "bg-yellow-400",
  Apply: "bg-amber-400",
};

const COLOR_CHOICES = [
  "bg-pink-400",
  "bg-purple-400",
  "bg-sky-400",
  "bg-orange-400",
  "bg-blue-400",
  "bg-emerald-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-amber-400",
  "bg-red-400",
  "bg-indigo-400",
  "bg-teal-400",
  "bg-fuchsia-400",
  "bg-rose-400",
  "bg-lime-400",
  "bg-cyan-400",
  "bg-violet-400",
];

const DEFAULT_TYPES: BookmarkType[] = ["Read", "Watch", "Listen", "Browse"];
const DEFAULT_ACTIONS: BookmarkAction[] = [
  "Use",
  "Build",
  "Learn",
  "Join",
  "Follow",
  "Apply",
];

const typeFilters: BookmarkType[] = ["Read", "Watch", "Listen", "Browse"];
const actionFilters: BookmarkAction[] = [
  "Use",
  "Build",
  "Learn",
  "Join",
  "Follow",
  "Apply",
];

function FilterPill({
  label,
  active,
  colorClass,
  onClick,
  onRemove,
}: {
  label: string;
  active: boolean;
  colorClass: string;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "group/pill relative inline-flex items-center rounded-lg border transition-all",
        "border-neutral-300 dark:border-neutral-700",
        active &&
          "bg-neutral-200/80 dark:bg-neutral-800/80 ring-1 ring-neutral-300 dark:ring-neutral-700"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-l-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
          "hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
        )}
        aria-pressed={active}
      >
        <span className={cn("h-2 w-2 rounded-full", colorClass)} />
        {label}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className={cn(
            "rounded-r-lg px-1.5 py-1.5 text-muted-foreground/60 transition-colors",
            "hover:bg-neutral-200/80 hover:text-foreground dark:hover:bg-neutral-800/80"
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

function AddCategoryButton({
  placeholder,
  existing,
  onAdd,
  defaultColor,
}: {
  placeholder: string;
  existing: string[];
  onAdd: (label: string, color: string) => void;
  defaultColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [color, setColor] = useState(defaultColor);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setColor(defaultColor);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setValue("");
    }
  }, [open, defaultColor]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = () => {
    const label = value.trim();
    if (!label) return;
    if (existing.includes(label)) {
      setValue("");
      return;
    }
    onAdd(label, color);
    setValue("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 text-xs font-medium transition-colors",
          "border-neutral-300 text-muted-foreground hover:border-neutral-400 hover:text-foreground",
          "dark:border-neutral-700 dark:hover:border-neutral-600"
        )}
        style={{ height: "36px" }}
        aria-expanded={open}
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
      {open && (
        <div
          className={cn(
            "absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg border p-3 shadow-lg",
            "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          )}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={placeholder}
            className={cn(
              "h-8 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Pick color ${c}`}
                className={cn(
                  "h-4 w-4 rounded-full transition-transform",
                  c,
                  color === c
                    ? "ring-2 ring-offset-2 ring-neutral-900 dark:ring-neutral-100 dark:ring-offset-neutral-950"
                    : "hover:scale-110"
                )}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              className={cn(
                "rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white transition-colors",
                "hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BookmarkRow({
  item,
  actionColorClass,
  editMode,
  selectMode,
  selected,
  onToggleSelected,
  onEdit,
}: {
  item: BookmarkItem;
  actionColorClass: string;
  editMode: boolean;
  selectMode?: boolean;
  selected: boolean;
  onToggleSelected: (id: string) => void;
  onEdit: (item: BookmarkItem) => void;
}) {
  const showCheckbox = selectMode;
  return (
    <li className="flex items-center gap-3 py-2.5 text-sm transition-[opacity,color] duration-200 group-hover:opacity-50 hover:!opacity-100">
      {showCheckbox && (
        <span
          role="checkbox"
          tabIndex={0}
          aria-checked={selected}
          aria-label={`Select ${item.title}`}
          onClick={() => onToggleSelected(item.id)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              onToggleSelected(item.id);
            }
          }}
          className={cn(
            "grid h-3.5 w-3.5 shrink-0 cursor-pointer place-items-center rounded-sm border transition-colors",
            selected
              ? "border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100"
              : "border-neutral-400 hover:border-neutral-600 dark:border-neutral-600 dark:hover:border-neutral-400"
          )}
        >
          {selected && (
            <svg
              viewBox="0 0 12 12"
              className="h-2.5 w-2.5 text-white dark:text-neutral-900"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="2.5 6 5 8.5 9.5 3.5" />
            </svg>
          )}
        </span>
      )}
      <a
        href={editMode ? undefined : item.href}
        target={editMode ? undefined : "_blank"}
        rel="noreferrer"
        onClick={(e) => {
          if (editMode) {
            e.preventDefault();
            onEdit(item);
          }
        }}
        className="group/link flex min-w-0 flex-1 items-center gap-3"
      >
        {editMode ? (
          <Pencil
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover/link:text-foreground"
            aria-hidden="true"
          />
        ) : (
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              actionColorClass
            )}
          />
        )}
      <span
        className="min-w-0 max-w-[20ch] shrink truncate font-semibold tracking-tight"
        title={item.title}
      >
        {item.title}
      </span>
      <span className="text-muted-foreground">·</span>
      <span
        className="min-w-0 max-w-[48ch] shrink truncate text-muted-foreground group-hover/link:text-foreground/80"
        title={item.description}
      >
        {item.description}
      </span>
      <span className="ml-auto shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground">
        {item.date}
      </span>
    </a>
    </li>
  );
}

function AddTagButton({
  onAddType,
  onAddAction,
  existingTypes,
  existingActions,
}: {
  onAddType: (label: string, color: string) => void;
  onAddAction: (label: string, color: string) => void;
  existingTypes: string[];
  existingActions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"type" | "action">("type");
  const [value, setValue] = useState("");
  const [color, setColor] = useState("bg-pink-400");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setColor(kind === "type" ? "bg-pink-400" : "bg-blue-400");
      setValue("");
    }
  }, [open, kind]);

  const submit = () => {
    const label = value.trim();
    if (!label) return;
    const existing = kind === "type" ? existingTypes : existingActions;
    if (existing.includes(label)) {
      setValue("");
      return;
    }
    if (kind === "type") onAddType(label, color);
    else onAddAction(label, color);
    setValue("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        data-add-tag-trigger=""
        className={cn(
          "group/add inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 text-xs font-medium transition-colors",
          "border-neutral-300 text-muted-foreground hover:border-neutral-400 hover:text-foreground",
          "dark:border-neutral-700 dark:hover:border-neutral-600"
        )}
        style={{ height: "32px" }}
      >
        <Plus className="h-3.5 w-3.5" />
        Add tag
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new tag</DialogTitle>
          <DialogDescription>
            Create a new type or action category for your bookmarks.
          </DialogDescription>
        </DialogHeader>

        {/* Kind toggle */}
        <div className="flex items-center gap-1 rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800">
          {(["type", "action"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "flex-1 rounded px-2 py-1 text-xs font-medium capitalize transition-colors",
                kind === k
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {k}
            </button>
          ))}
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={kind === "type" ? "New type name..." : "New action name..."}
          autoFocus
          className={cn(
            "h-8 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            "dark:border-neutral-700"
          )}
        />
        <div className="flex flex-wrap gap-1.5">
          {COLOR_CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Pick color ${c}`}
              className={cn(
                "h-4 w-4 rounded-full transition-transform",
                c,
                color === c
                  ? "ring-2 ring-offset-2 ring-neutral-900 dark:ring-neutral-100 dark:ring-offset-neutral-950"
                  : "hover:scale-110"
              )}
            />
          ))}
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            className={cn(
              "rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors",
              "hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Add
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddBookmarkButton({
  allTypes,
  allActions,
  onAddType,
  onAddAction,
  onAddBookmark,
  getTypeColor,
  getActionColor,
}: {
  allTypes: string[];
  allActions: string[];
  onAddType: (label: string, color: string) => void;
  onAddAction: (label: string, color: string) => void;
  onAddBookmark: (b: {
    title: string;
    href: string;
    description?: string;
    tags: string[];
  }) => void;
  getTypeColor: (t: string) => string;
  getActionColor: (a: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTagColor, setNewTagColor] = useState("bg-pink-400");
  const [newTagKind, setNewTagKind] = useState<"type" | "action">("type");
  const nameTouched = useRef(false);
  const descTouched = useRef(false);

  useEffect(() => {
    if (!open) {
      setUrl("");
      setName("");
      setDescription("");
      setTags([]);
      setError("");
      setNewTag("");
      nameTouched.current = false;
      descTouched.current = false;
    }
  }, [open]);

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || nameTouched.current) return;
    const timer = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch("/api/fetch-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = (await res.json()) as { title?: string; description?: string };
        if (data.title && !nameTouched.current) setName(data.title);
        if (data.description && !descTouched.current) setDescription(data.description);
      } catch {
        /* ignore */
      } finally {
        setFetching(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [url]);

  const handleAddNewTag = () => {
    const label = newTag.trim();
    if (!label) return;
    if (allTypes.includes(label) || allActions.includes(label)) {
      setNewTag("");
      return;
    }
    if (newTagKind === "type") onAddType(label, newTagColor);
    else onAddAction(label, newTagColor);
    setTags((prev) => [...prev, label]);
    setNewTag("");
  };

  const submit = () => {
    if (!url.trim()) {
      setError("URL is required");
      return;
    }
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    onAddBookmark({
      title: name.trim(),
      href: url.trim(),
      description: description.trim() || undefined,
      tags,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        data-add-bookmark-trigger=""
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all",
          "border-pink-300 bg-white text-pink-700 hover:bg-pink-50 hover:border-pink-400",
          "dark:border-pink-400/50 dark:bg-white dark:text-pink-700 dark:hover:bg-pink-50"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Bookmark
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new bookmark</DialogTitle>
          <DialogDescription>
            Paste a URL — we&apos;ll fetch the title and description. Pick or
            create tags, then save.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
            className={cn(
              "h-9 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Name
            {fetching && (
              <span className="text-[10px] normal-case tracking-normal text-muted-foreground/70">
                fetching…
              </span>
            )}
          </label>
          <input
            value={name}
            onChange={(e) => {
              nameTouched.current = true;
              setName(e.target.value);
            }}
            placeholder="Bookmark name"
            className={cn(
              "h-9 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => {
              descTouched.current = true;
              setDescription(e.target.value);
            }}
            placeholder="Optional short description"
            className={cn(
              "h-9 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tags
          </label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100/60 px-2.5 py-1 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-800/60"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      getTypeColor(t) !== "bg-neutral-400"
                        ? getTypeColor(t)
                        : getActionColor(t)
                    )}
                  />
                  {t}
                  <button
                    type="button"
                    aria-label={`Remove ${t}`}
                    onClick={() =>
                      setTags((prev) => prev.filter((v) => v !== t))
                    }
                    className="-mr-1 ml-0.5 grid size-4 place-items-center rounded text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {allTypes.map((t) => (
              <button
                key={`t-${t}`}
                type="button"
                onClick={() =>
                  setTags((prev) =>
                    prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t]
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  tags.includes(t)
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-300 text-muted-foreground hover:text-foreground dark:border-neutral-700"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", getTypeColor(t))} />
                {t}
              </button>
            ))}
            {allActions.map((a) => (
              <button
                key={`a-${a}`}
                type="button"
                onClick={() =>
                  setTags((prev) =>
                    prev.includes(a) ? prev.filter((v) => v !== a) : [...prev, a]
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  tags.includes(a)
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-300 text-muted-foreground hover:text-foreground dark:border-neutral-700"
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", getActionColor(a))}
                />
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-dashed border-neutral-300 p-3 dark:border-neutral-700">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Create new tag
          </span>

          {/* Kind toggle */}
          <div className="flex w-full items-center gap-1 rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800">
            {(["type", "action"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setNewTagKind(k);
                  setNewTagColor(k === "type" ? "bg-pink-400" : "bg-blue-400");
                }}
                className={cn(
                  "flex-1 rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                  newTagKind === k
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Name input */}
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddNewTag();
            }}
            placeholder={
              newTagKind === "type" ? "New type name…" : "New action name…"
            }
            className={cn(
              "h-8 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-xs outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />

          {/* Color swatches */}
          <div className="flex flex-wrap items-center gap-1.5">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewTagColor(c)}
                aria-label={`Pick color ${c}`}
                className={cn(
                  "h-4 w-4 rounded-full transition-transform",
                  c,
                  newTagColor === c
                    ? "ring-2 ring-offset-1 ring-neutral-900 dark:ring-neutral-100 dark:ring-offset-neutral-950"
                    : "hover:scale-110"
                )}
              />
            ))}
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAddNewTag}
            disabled={!newTag.trim()}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors",
              "hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Add tag
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className={cn(
              "rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors",
              "hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            )}
          >
            Save bookmark
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditBookmarkDialog({
  bookmark,
  allTypes,
  allActions,
  onAddType,
  onAddAction,
  onUpdateBookmark,
  onDeleteBookmark,
  getTypeColor,
  getActionColor,
  onOpenChange,
}: {
  bookmark: BookmarkItem | null;
  allTypes: string[];
  allActions: string[];
  onAddType: (label: string, color: string) => void;
  onAddAction: (label: string, color: string) => void;
  onUpdateBookmark: (
    id: string,
    b: { title: string; href: string; description?: string; tags: string[] }
  ) => void;
  onDeleteBookmark: (id: string) => void;
  getTypeColor: (t: string) => string;
  getActionColor: (a: string) => string;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTagColor, setNewTagColor] = useState("bg-pink-400");
  const [newTagKind, setNewTagKind] = useState<"type" | "action">("type");

  useEffect(() => {
    if (bookmark) {
      setName(bookmark.title);
      setUrl(bookmark.href);
      setDescription(bookmark.description);
      setTags([bookmark.type, bookmark.action]);
      setError("");
    }
  }, [bookmark]);

  const handleAddNewTag = () => {
    const label = newTag.trim();
    if (!label) return;
    if (allTypes.includes(label) || allActions.includes(label)) {
      setNewTag("");
      return;
    }
    if (newTagKind === "type") onAddType(label, newTagColor);
    else onAddAction(label, newTagColor);
    setTags((prev) => [...prev, label]);
    setNewTag("");
  };

  const submit = () => {
    if (!bookmark) return;
    if (!url.trim()) {
      setError("URL is required");
      return;
    }
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    onUpdateBookmark(bookmark.id, {
      title: name.trim(),
      href: url.trim(),
      description: description.trim() || undefined,
      tags,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!bookmark) return;
    onDeleteBookmark(bookmark.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={!!bookmark} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit bookmark</DialogTitle>
          <DialogDescription>
            Update the details for this bookmark.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className={cn(
              "h-9 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bookmark name"
            className={cn(
              "h-9 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description"
            className={cn(
              "h-9 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tags
          </label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100/60 px-2.5 py-1 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-800/60"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      getTypeColor(t) !== "bg-neutral-400"
                        ? getTypeColor(t)
                        : getActionColor(t)
                    )}
                  />
                  {t}
                  <button
                    type="button"
                    aria-label={`Remove ${t}`}
                    onClick={() =>
                      setTags((prev) => prev.filter((v) => v !== t))
                    }
                    className="-mr-1 ml-0.5 grid size-4 place-items-center rounded text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {allTypes.map((t) => (
              <button
                key={`t-${t}`}
                type="button"
                onClick={() =>
                  setTags((prev) =>
                    prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t]
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  tags.includes(t)
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-300 text-muted-foreground hover:text-foreground dark:border-neutral-700"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", getTypeColor(t))} />
                {t}
              </button>
            ))}
            {allActions.map((a) => (
              <button
                key={`a-${a}`}
                type="button"
                onClick={() =>
                  setTags((prev) =>
                    prev.includes(a) ? prev.filter((v) => v !== a) : [...prev, a]
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  tags.includes(a)
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-300 text-muted-foreground hover:text-foreground dark:border-neutral-700"
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", getActionColor(a))}
                />
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-dashed border-neutral-300 p-3 dark:border-neutral-700">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Create new tag
          </span>

          {/* Kind toggle */}
          <div className="flex w-full items-center gap-1 rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800">
            {(["type", "action"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setNewTagKind(k);
                  setNewTagColor(k === "type" ? "bg-pink-400" : "bg-blue-400");
                }}
                className={cn(
                  "flex-1 rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                  newTagKind === k
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Name input */}
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddNewTag();
            }}
            placeholder={
              newTagKind === "type" ? "New type name…" : "New action name…"
            }
            className={cn(
              "h-8 w-full rounded-md border border-neutral-300 bg-transparent px-2.5 text-xs outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              "dark:border-neutral-700"
            )}
          />

          {/* Color swatches */}
          <div className="flex flex-wrap items-center gap-1.5">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewTagColor(c)}
                aria-label={`Pick color ${c}`}
                className={cn(
                  "h-4 w-4 rounded-full transition-transform",
                  c,
                  newTagColor === c
                    ? "ring-2 ring-offset-1 ring-neutral-900 dark:ring-neutral-100 dark:ring-offset-neutral-950"
                    : "hover:scale-110"
                )}
              />
            ))}
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAddNewTag}
            disabled={!newTag.trim()}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors",
              "hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Add tag
          </button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className={cn(
                "rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors",
                "hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              )}
            >
              Save changes
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BookmarkPage() {
  // ---- Supabase-backed data layer ----
  // The page used to seed from a hardcoded `bookmarks` array; now it
  // delegates to the `useBookmarks()` hook which talks to
  // /api/bookmarks + /api/tags. The local shape (`bookmarkList`,
  // `customTypes`, `customActions`) is kept so the rest of the page
  // doesn't have to be rewritten — `customTypes` / `customActions` are
  // now derived from `customTags` returned by the hook.
  const {
    bookmarks: apiBookmarks,
    customTags: apiCustomTags,
    loaded: apiLoaded,
    addBookmark: apiAddBookmark,
    updateBookmark: apiUpdateBookmark,
    deleteBookmark: apiDeleteBookmark,
    deleteBookmarksBulk: apiDeleteBookmarksBulk,
    addCustomTag: apiAddCustomTag,
    deleteCustomTag: apiDeleteCustomTag,
  } = useBookmarks();

  // The custom tags returned by Supabase split by `kind` so the page's
  // existing `customTypes` / `customActions` shape is preserved.
  const customTypes: { label: string; color: string }[] = useMemo(
    () =>
      apiCustomTags
        .filter((t) => t.kind === "type")
        .map((t) => ({ label: t.label, color: t.color })),
    [apiCustomTags]
  );
  const customActions: { label: string; color: string }[] = useMemo(
    () =>
      apiCustomTags
        .filter((t) => t.kind === "action")
        .map((t) => ({ label: t.label, color: t.color })),
    [apiCustomTags]
  );

  // Map the API bookmark shape to the page's local `BookmarkItem`
  // (the rest of the page expects a non-nullable `description` and a
  // `date` string).
  const bookmarkList: BookmarkItem[] = useMemo(
    () =>
      apiBookmarks.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description ?? b.href,
        type: b.type as BookmarkType,
        action: b.action as BookmarkAction,
        date: b.date ?? "",
        href: b.href,
      })),
    [apiBookmarks]
  );

  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<BookmarkType>>(new Set());
  const [activeActions, setActiveActions] = useState<Set<BookmarkAction>>(
    new Set()
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allTypes = useMemo(
    () => [...typeFilters, ...customTypes.map((c) => c.label)],
    [customTypes]
  );
  const allActions = useMemo(
    () => [...actionFilters, ...customActions.map((c) => c.label)],
    [customActions]
  );

  const getTypeColor = (t: BookmarkType) =>
    TYPE_PALETTE[t] ??
    customTypes.find((c) => c.label === t)?.color ??
    "bg-neutral-400";
  const getActionColor = (a: BookmarkAction) =>
    ACTION_PALETTE[a] ??
    customActions.find((c) => c.label === a)?.color ??
    "bg-neutral-400";
  const getTagColor = (label: string) =>
    getTypeColor(label) !== "bg-neutral-400"
      ? getTypeColor(label)
      : getActionColor(label);

  const tagOptions = useMemo(
    () => [
      ...allTypes.map((label) => ({
        id: label,
        name: label,
        color: getTypeColor(label),
      })),
      ...allActions.map((label) => ({
        id: label,
        name: label,
        color: getActionColor(label),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allTypes, allActions, customTypes, customActions]
  );

  const toggleType = (t: BookmarkType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const toggleAction = (a: BookmarkAction) => {
    setActiveActions((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  };

  const removeType = async (t: string) => {
    const target = apiCustomTags.find((x) => x.kind === "type" && x.label === t);
    if (target) await apiDeleteCustomTag(target.id);
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.delete(t);
      return next;
    });
    setSelectedTags((prev) => prev.filter((v) => v !== t));
  };
  const removeAction = async (a: string) => {
    const target = apiCustomTags.find((x) => x.kind === "action" && x.label === a);
    if (target) await apiDeleteCustomTag(target.id);
    setActiveActions((prev) => {
      const next = new Set(prev);
      next.delete(a);
      return next;
    });
    setSelectedTags((prev) => prev.filter((v) => v !== a));
  };

  const [editMode, setEditMode] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);

  const addType = async (label: string, color: string) => {
    try {
      await apiAddCustomTag({ label, color, kind: "type" });
      toast.add({
        type: "success",
        title: "Type added",
        description: `"${label}" is now a filterable type.`,
      });
    } catch {
      // Hook already toasts on failure.
    }
  };
  const addAction = async (label: string, color: string) => {
    try {
      await apiAddCustomTag({ label, color, kind: "action" });
      toast.add({
        type: "success",
        title: "Action added",
        description: `"${label}" is now a filterable action.`,
      });
    } catch {
      // Hook already toasts on failure.
    }
  };

  const addBookmark = async (b: {
    title: string;
    href: string;
    tags: string[];
    description?: string;
  }) => {
    try {
      await apiAddBookmark(b);
      toast.add({
        type: "success",
        title: "Bookmark added",
        description: b.title,
      });
    } catch {
      // Hook already toasts on failure.
    }
  };

  const updateBookmark = async (
    id: string,
    b: { title: string; href: string; tags: string[]; description?: string }
  ) => {
    try {
      await apiUpdateBookmark(id, b);
      toast.add({
        type: "success",
        title: "Bookmark updated",
        description: b.title,
      });
    } catch {
      // Hook already toasts on failure.
    }
  };

  const deleteBookmark = async (id: string) => {
    const target = bookmarkList.find((bm) => bm.id === id);
    try {
      await apiDeleteBookmark(id);
      if (target) {
        toast.add({
          type: "info",
          title: "Bookmark deleted",
          description: target.title,
        });
      }
    } catch {
      // Hook already toasts on failure.
    }
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelectMode = () => {
    setSelectMode(true);
    setEditMode(false);
    setEditingBookmark(null);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const confirmDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    const count = ids.length;
    if (count === 0) return;
    setSelectedIds(new Set());
    setSelectMode(false);
    try {
      await apiDeleteBookmarksBulk(ids);
      toast.add({
        type: "info",
        title: `${count} bookmark${count === 1 ? "" : "s"} deleted`,
      });
    } catch {
      // Hook already toasts on failure.
    }
  };

  const clearAll = () => {
    setQuery("");
    setActiveTypes(new Set());
    setActiveActions(new Set());
    setSelectedTags([]);
    setSelectedIds(new Set());
    toast.add({
      type: "info",
      title: "Filters cleared",
      description: "Search and tag filters have been reset.",
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookmarkList.filter((b) => {
      if (activeTypes.size > 0 && !activeTypes.has(b.type)) return false;
      if (activeActions.size > 0 && !activeActions.has(b.action)) return false;
      if (
        selectedTags.length > 0 &&
        !selectedTags.includes(b.type) &&
        !selectedTags.includes(b.action)
      )
        return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    });
  }, [bookmarkList, query, activeTypes, activeActions, selectedTags]);

  return (
    <main className="relative min-h-[calc(100vh-4rem)] w-full">
      <Container className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-6 py-16 sm:py-20 sm:px-10">
        {/* BLINKING GRID BACKGROUND TOP LEFT */}
        <div className="absolute top-0 left-0 w-[500px] h-[400px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_50%)] opacity-70 dark:opacity-90">
          <BlinkingGrid />
        </div>

        {/* BLINKING GRID BACKGROUND TOP RIGHT */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_50%)] opacity-70 dark:opacity-90">
          <BlinkingGrid />
        </div>

        {/* BLINKING GRID BACKGROUND BOTTOM LEFT */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_bottom_left,black_10%,transparent_50%)] opacity-70 dark:opacity-90">
          <BlinkingGrid />
        </div>

        {/* BLINKING GRID BACKGROUND BOTTOM RIGHT */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_bottom_right,black_10%,transparent_50%)] opacity-70 dark:opacity-90">
          <BlinkingGrid />
        </div>

        <div className="relative z-10">
        <div className="mb-8 flex items-baseline justify-center gap-2">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Browse <em className="not-italic font-serif italic">Bookmarks:</em>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-3">
          {/* TOP ROW: Search + Tags multi-select + Add + Clear All.
              All four elements share the same `h-9` height, `rounded-lg`
              border, `text-xs` label, and `px-2.5` padding so they line
              up flush — no more uneven button/input heights. */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search here..."
              className="h-9 w-full min-w-0 rounded-lg border border-neutral-300 bg-transparent px-2.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-neutral-400 dark:border-neutral-700 sm:w-56"
            />

            <MultipleSelect
              placeholder="Search tags…"
              className="w-60"
              items={tagOptions}
              selectedKeys={new Set(selectedTags)}
              onSelectionChange={(keys) => setSelectedTags(Array.from(keys))}
            >
              {(item) => (
                <span className="inline-flex flex-1 items-center gap-2">
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", item.color)}
                  />
                  {item.name}
                </span>
              )}
            </MultipleSelect>

            <AddBookmarkButton
              allTypes={allTypes}
              allActions={allActions}
              onAddType={addType}
              onAddAction={addAction}
              onAddBookmark={addBookmark}
              getTypeColor={getTypeColor}
              getActionColor={getActionColor}
            />

            <button
              type="button"
              onClick={clearAll}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border px-3.5 text-xs font-medium transition-all",
                "border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600",
                "dark:border-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-600"
              )}
              style={{ height: "36px" }}
            >
              Clear All
            </button>
          </div>

          {/* EDIT BOOKMARK DIALOG (controlled by editingBookmark state) */}
          <EditBookmarkDialog
            bookmark={editingBookmark}
            allTypes={allTypes}
            allActions={allActions}
            onAddType={addType}
            onAddAction={addAction}
            onUpdateBookmark={updateBookmark}
            onDeleteBookmark={deleteBookmark}
            getTypeColor={getTypeColor}
            getActionColor={getActionColor}
            onOpenChange={(open) => {
              if (!open) setEditingBookmark(null);
            }}
          />

          {/* PILLS ROW: first 3 type + first 3 action + Add tag */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {allTypes.slice(0, 3).map((t) => (
              <FilterPill
                key={t}
                label={t}
                colorClass={getTypeColor(t)}
                active={activeTypes.has(t)}
                onClick={() => toggleType(t)}
                onRemove={customTypes.some((c) => c.label === t) ? () => removeType(t) : undefined}
              />
            ))}
            <span
              aria-hidden
              className="mx-0.5 h-5 w-px bg-neutral-300 dark:bg-neutral-700"
            />
            {allActions.slice(0, 3).map((a) => (
              <FilterPill
                key={a}
                label={a}
                colorClass={getActionColor(a)}
                active={activeActions.has(a)}
                onClick={() => toggleAction(a)}
                onRemove={
                  customActions.some((c) => c.label === a)
                    ? () => removeAction(a)
                    : undefined
                }
              />
            ))}
            <AddTagButton
              onAddType={addType}
              onAddAction={addAction}
              existingTypes={allTypes}
              existingActions={allActions}
            />
          </div>
        </div>
        </div>

        <div className="mt-10">
          {!apiLoaded ? (
            <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-muted-foreground dark:border-neutral-700">
              Loading bookmarks from Supabase…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-muted-foreground dark:border-neutral-700">
              No bookmarks match your filters.
            </div>
          ) : (
            <ul className="group divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
              {filtered.map((item) => (
                <BookmarkRow
                  key={item.id}
                  item={item}
                  actionColorClass={getActionColor(item.action)}
                  editMode={editMode}
                  selectMode={selectMode}
                  selected={selectedIds.has(item.id)}
                  onToggleSelected={toggleSelected}
                  onEdit={setEditingBookmark}
                />
              ))}
            </ul>
          )}
        </div>

        {/* FOOTER */}
        <div className="relative z-10 mt-16 flex items-center justify-center gap-2 pb-4 text-xs text-muted-foreground">
          <span>created by</span>
          <a
            href="https://x.com/sahilcodex"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            @sahilcodex
          </a>
        </div>
      </Container>

      {/* FLOATING DOCK — QUICK ACTIONS */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center">
        <div className="pointer-events-auto">
          <Dock size={44}>
            <Tooltip content="Home" side="top">
              <DockItem aria-label="Home">
                <a href="/" aria-label="Home" className="flex items-center justify-center">
                  <Home className="size-4" />
                </a>
              </DockItem>
            </Tooltip>
            <DockSeparator />
            <Tooltip content={editMode ? "Stop editing" : "Edit bookmarks"} side="top">
              <DockItem
                onClick={() => {
                  setEditMode((v) => !v);
                  setEditingBookmark(null);
                }}
                active={editMode}
                aria-label="Edit"
              >
                <Pencil className="size-4" />
              </DockItem>
            </Tooltip>
            <Tooltip content="Add bookmark" side="top">
              <DockItem
                onClick={() => {
                  const btn = document.querySelector<HTMLButtonElement>(
                    '[data-add-bookmark-trigger]'
                  );
                  btn?.click();
                }}
                aria-label="Add bookmark"
              >
                <Plus className="size-4" />
              </DockItem>
            </Tooltip>
            <Tooltip content={selectMode ? "Exit select" : "Delete bookmarks"} side="top">
              <DockItem
                onClick={enterSelectMode}
                active={selectMode}
                aria-label="Delete bookmarks"
              >
                <Trash2 className="size-4" />
              </DockItem>
            </Tooltip>
          </Dock>
        </div>
      </div>

      {/* FLOATING SELECT ACTION BAR */}
      {selectMode && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-950/90">
            <span className="px-2 text-xs font-medium text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : "Select items"}
            </span>
            <button
              type="button"
              onClick={exitSelectMode}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-neutral-200/60 hover:text-foreground dark:hover:bg-neutral-800/60"
            >
              <X className="size-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteSelected}
              disabled={selectedIds.size === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors",
                "hover:bg-red-600",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-500"
              )}
            >
              <Trash2 className="size-3.5" />
              Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
