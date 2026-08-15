"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { getAdSlot, type AdSlots } from "@/lib/ads/config";
import { cn } from "@/lib/utils";

type AdSlotProps = {
  slot: keyof AdSlots;
  className?: string;
};

export function AdSlot({ slot, className }: AdSlotProps) {
  const { t } = useLanguage();
  const creative = getAdSlot(slot);

  if (!creative.enabled) return null;

  const hasImage = Boolean(creative.imageUrl?.trim());
  const hasHtml = Boolean(creative.html?.trim());

  if (!hasImage && !hasHtml) {
    return (
      <Card className={cn("border-dashed border-border bg-muted/30", className)}>
        <CardContent className="flex min-h-[250px] flex-col items-center justify-center gap-2 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.adLabel}</p>
          <p className="text-sm text-muted-foreground">{t.adPlaceholder}</p>
          <p className="text-xs text-muted-foreground/80">{t.adConfigHint}</p>
        </CardContent>
      </Card>
    );
  }

  if (hasHtml) {
    return (
      <Card className={cn("border-border bg-card", className)}>
        <CardContent className="p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t.adLabel}</p>
          <div className="ad-slot-html" dangerouslySetInnerHTML={{ __html: creative.html! }} />
        </CardContent>
      </Card>
    );
  }

  const image = (
    // ponytail: plain img so any ad banner URL works without next/image remote config
    <img
      src={creative.imageUrl!}
      alt={creative.alt || t.adLabel}
      className="h-auto w-full rounded-lg object-cover"
      loading="lazy"
    />
  );

  return (
    <Card className={cn("border-border bg-card", className)}>
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
