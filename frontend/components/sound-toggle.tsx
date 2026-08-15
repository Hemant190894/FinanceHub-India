"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSoundEnabled, setSoundEnabled, subscribeSoundEnabled } from "@/lib/sound";

export function SoundToggle({ className }: { className?: string }) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const enabled = useSyncExternalStore(subscribeSoundEnabled, isSoundEnabled, () => true);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn("size-8", className)} aria-hidden />;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={className}
      onClick={() => setSoundEnabled(!enabled)}
      aria-label={enabled ? t.soundOn : t.soundOff}
      title={enabled ? t.soundOn : t.soundOff}
    >
      <span className="relative inline-flex size-4 items-center justify-center">
        <Volume2
          className={cn(
            "absolute size-4 transition-[transform,opacity] duration-200 ease-(--ease-out) motion-reduce:transition-opacity",
            enabled ? "rotate-0 scale-100 opacity-100" : "-rotate-12 scale-75 opacity-0",
          )}
        />
        <VolumeX
          className={cn(
            "absolute size-4 transition-[transform,opacity] duration-200 ease-(--ease-out) motion-reduce:transition-opacity",
            enabled ? "rotate-12 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100",
          )}
        />
      </span>
    </Button>
  );
}
