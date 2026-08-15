"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn("size-8", className)} aria-hidden />;
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.themeLight : t.themeDark}
      title={isDark ? t.themeLight : t.themeDark}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
