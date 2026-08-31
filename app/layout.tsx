import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { CommandPaletteRoot } from "@/components/command-palette-root";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Bookmrkly",
  description: "A better way to save and revisit links anytime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden ">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header />

          {children}

          {/* Global command palette (Cmd/Ctrl+K). */}
          <CommandPaletteRoot />

          {/* Toast viewport — one per app, sits above the page content. */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
