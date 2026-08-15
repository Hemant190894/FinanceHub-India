"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { getAdSlot, type AdSlots } from "@/lib/ads/config";
import { cn } from "@/lib/utils";

type AdSlotProps = {
  slot: keyof AdSlots;
  className?: string;
  /** panel = tall left banner; default = bottom box */
  variant?: "default" | "panel";
};

export function AdSlot({ slot, className, variant = "default" }: AdSlotProps) {
  const { t } = useLanguage();
  const creative = getAdSlot(slot);

  if (!creative.enabled) return null;

  const hasImage = Boolean(creative.imageUrl?.trim());
  const hasHtml = Boolean(creative.html?.trim());
  const isPanel = variant === "panel";

  const placeholderMin = isPanel ? "min-h-[min(560px,72vh)]" : "min-h-[200px]";

  if (!hasImage && !hasHtml) {
    return (
      <Card className={cn("border-dashed border-border bg-muted/30", placeholderMin, className)}>
        <CardContent className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.adLabel}</p>
          <p className="text-sm text-muted-foreground">{t.adPlaceholder}</p>
          <p className="text-xs text-muted-foreground/80">{t.adConfigHint}</p>
        </CardContent>
      </Card>
    );
  }

  if (hasHtml) {
    return (
      <Card className={cn("border-border bg-card", isPanel && "min-h-[min(560px,72vh)]", className)}>
        <CardContent className="flex h-full flex-col p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t.adLabel}</p>
          <div className="ad-slot-html flex-1" dangerouslySetInnerHTML={{ __html: creative.html! }} />
        </CardContent>
      </Card>
    );
  }

  const image = (
    <img
      src={creative.imageUrl!}
      alt={creative.alt || t.adLabel}
      className={cn(
        "w-full rounded-lg object-cover",
        isPanel ? "min-h-[min(520px,70vh)] object-cover" : "h-auto",
      )}
      loading="lazy"
    />
  );

  return (
    <Card className={cn("border-border bg-card", isPanel && "min-h-[min(560px,72vh)]", className)}>
      <CardContent className="p-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t.adLabel}</p>
        {creative.href?.trim() ? (
          <a href={creative.href} target="_blank" rel="noopener noreferrer sponsored" className="block">
            {image}
          </a>
        ) : (
          image
        )}
      </CardContent>
    </Card>
  );
}
