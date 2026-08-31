import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
})
Input.displayName = "Input"

// `InputGroup` is a thin wrapper around an inline-flex container — used by
// the intentui MultipleSelect to lay out an icon + the input + a clear
// button. Adding it here keeps the intentui SearchField/Field API
// (which imports `InputGroup` from `./input`) happy without dragging in
// their full intentui Input primitive.
const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="input-group"
    className={cn(
      "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-input/20 px-2.5 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 dark:bg-input/30",
      className,
    )}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

export { Input, InputGroup }
