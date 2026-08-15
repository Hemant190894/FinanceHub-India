"use client";

import { ThemeProvider } from "next-themes";

import { LanguageProvider } from "./language-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="financehub-theme">
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
