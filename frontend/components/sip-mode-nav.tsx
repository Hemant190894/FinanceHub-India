"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { SIP_MODES, type SipMode } from "@/lib/investment/config";
import { cn } from "@/lib/utils";

const MODE_LABEL_KEYS: Record<SipMode, keyof import("@/lib/i18n/types").TranslationKeys> = {
  normal: "sipModeNormal",
  pro: "sipModePro",
  "pro-plus": "sipModeProPlus",
};

type SipModeNavProps = {
  mode: SipMode;
  onModeChange: (mode: SipMode) => void;
};

export function SipModeNav({ mode, onModeChange }: SipModeNavProps) {
  const { t } = useLanguage();

  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="SIP calculator modes">
      {SIP_MODES.map((item) => {
        const active = mode === item;
        const label = t[MODE_LABEL_KEYS[item]] as string;
        const isSoon = item === "pro-plus";

        return (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className={cn("rounded-full px-4", active && "bg-emerald-600 hover:bg-emerald-500")}
            aria-current={active ? "true" : undefined}
            onClick={() => onModeChange(item)}
          >
            {label}
            {isSoon && !active && (
              <span className="ml-1.5 text-[10px] font-normal opacity-70">{t.statusSoon}</span>
            )}
          </Button>
        );
      })}
    </nav>
  );
}
