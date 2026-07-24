"use client"
import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon,  SwitchCamera } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-7 w-8 items-center justify-center rounded-lg border border-input bg-background p-0 transition-all duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "dark:border-input/50 dark:bg-input/20 dark:hover:bg-input/30 overflow-hidden cursor-pointer"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
        style={{
          transform: isDark
            ? "translateX(0)"
            : "translateX(calc(100% + 0.5rem))",
        }}
      >
        <Sun className="h-3.5 w-3.5" />
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
        style={{
          transform: isDark
            ? "translateX(calc(-100% - 0.5rem))"
            : "translateX(0)",
        }}
      >
        <Moon className="h-3.5 w-3.5" />
      </motion.div>
      
    </motion.button>
  )
}

export default ThemeToggle
