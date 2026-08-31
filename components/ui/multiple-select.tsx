'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Button } from 'react-aria-components/Button'
import { ListBox } from 'react-aria-components/ListBox'
import { ListBoxItem } from './list-box'
import { cn } from '@/lib/utils'

interface OptionBase {
  id: string | number
  name: string
}

export interface MultipleSelectProps<T extends OptionBase> {
  placeholder?: string
  className?: string
  /** Render function for each option in the popover list. */
  children?: (item: T) => ReactNode
  /** Options to render in the popover list. */
  items?: Iterable<T>
  /** Currently selected keys. */
  selectedKeys: Set<string>
  /** Called when the user picks or unpicks an option. */
  onSelectionChange: (keys: Set<string>) => void
  /** Optional name for form submission. */
  name?: string
}

// Custom multi-select: a typable input trigger that filters the list in
// the popover as you type, plus a `+` toggle. Picking/unpicking an item
// toggles it in the `selectedKeys` set.
//
// React Aria's `Select` (single or multi) wraps a Button as its trigger
// and doesn't accept text input — the input lives in the popover. The
// beui original pattern was the opposite: the trigger IS the input, and
// the popover is just the list. So we don't use `Select` here at all;
// we manage open/close and filter state ourselves and rely on
// `useDismiss` via a mousedown listener to close on outside click.
export function MultipleSelect<T extends OptionBase>({
  placeholder = 'Search tags…',
  className,
  children,
  items,
  selectedKeys,
  onSelectionChange,
  name,
}: MultipleSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  // Popover is positioned with `position: fixed` so it isn't clipped by
  // `overflow: hidden` on ancestor containers (the page Container has
  // overflow-hidden for the side rails). Coordinates are measured off
  // the trigger's bounding rect and recomputed on resize / scroll.
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const arr = useMemo(
    () => (items ? Array.from(items) : []),
    [items]
  )

  const filteredItems = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return arr
    return arr.filter((item) => item.name.toLowerCase().includes(q))
  }, [arr, searchValue])

  // Close on outside click — `useDismiss` from react-aria would be the
  // "official" path, but a tiny mousedown listener is enough here.
  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(target as HTMLElement).closest?.('[data-multiselect-popover]')
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

  // Measure the trigger's position so the popover can sit directly
  // below it. Recompute on resize and scroll so the popover tracks
  // the trigger if the page moves.
  useLayoutEffect(() => {
    if (!isOpen) {
      setPos(null)
      return
    }
    const measure = () => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [isOpen])

  const toggleItem = (id: string | number) => {
    const next = new Set(selectedKeys)
    if (next.has(String(id))) next.delete(String(id))
    else next.add(String(id))
    onSelectionChange(next)
  }

  return (
    <div ref={containerRef} className={cn('relative w-60', className)}>
      <div className="flex h-9 items-center gap-2 rounded-lg border border-neutral-300 bg-transparent px-2.5 text-xs transition-colors hover:border-neutral-400 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-ring/30 dark:border-neutral-700 dark:hover:border-neutral-600 dark:focus-within:border-neutral-600">
        <input
          ref={inputRef}
          name={name}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
        <Button
          aria-label={isOpen ? 'Close tags list' : 'Open tags list'}
          onPress={() => {
            setIsOpen((v) => !v)
            inputRef.current?.focus()
          }}
          className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-3.5"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>

      {isOpen && pos && (
        <div
          data-multiselect-popover=""
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
          }}
          className="z-50 overflow-hidden rounded-lg border border-neutral-200 bg-white text-foreground shadow-lg outline-hidden dark:border-neutral-800 dark:bg-neutral-950"
        >
          <ListBox<T>
            items={filteredItems}
            className="max-h-60 overflow-y-auto p-1 text-xs outline-hidden"
          >
            {(item) => {
              const isSelected = selectedKeys.has(String(item.id))
              return (
                <ListBoxItem
                  id={item.id}
                  textValue={item.name}
                  onAction={() => toggleItem(item.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs outline-hidden',
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800/60'
                      : 'data-[focused]:bg-neutral-100 dark:data-[focused]:bg-neutral-800/60'
                  )}
                >
                  {children ? (
                    children(item)
                  ) : (
                    <span className="flex-1">{item.name}</span>
                  )}
                  {isSelected && (
                    <svg
                      aria-hidden
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-3.5 shrink-0 text-foreground"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </ListBoxItem>
              )
            }}
          </ListBox>
        </div>
      )}
    </div>
  )
}
