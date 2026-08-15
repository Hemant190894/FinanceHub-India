"use client";

import { Globe } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { languageOptions } from "@/lib/i18n/translations";
import type { Language } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className={cn("flex items-center gap-2 text-sm", className)}>
      <Globe className="size-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">{t.languageLabel}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t.languageLabel}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
