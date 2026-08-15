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

function AdPlaceholder({ variant }: { variant: "default" | "panel" }) {
  const { t } = useLanguage();
  const isPanel = variant === "panel";

  return (
  <Card
    className={cn(
      "w-full border-2 border-dashed border-muted-foreground/25 bg-muted/40 shadow-none ring-0",
      isPanel ? "min-h-[min(560px,72vh)]" : "min-h-[200px]",
    )}
  >
    <CardContent
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-6 text-center",
        isPanel ? "min-h-[min(520px,70vh)]" : "min-h-[180px]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{t.adLabel}</p>
      <p className="text-base font-medium text-foreground/80">{t.adPlaceholder}</p>
      <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">{t.adConfigHint}</p>
    </CardContent>
  </Card>
  );
}

export function AdSlot({ slot, className, variant = "default" }: AdSlotProps) {
  const { t } = useLanguage();
  const creative = getAdSlot(slot);

  if (!creative.enabled) return null;

  const hasImage = Boolean(creative.imageUrl?.trim());
  const hasHtml = Boolean(creative.html?.trim());
  const isPanel = variant === "panel";

  if (!hasImage && !hasHtml) {
    return (
      <div className={cn("w-full", className)}>
        <AdPlaceholder variant={variant} />
      </div>
    );
  }

  if (hasHtml) {
    return (
      <Card
        className={cn(
          "w-full border border-border bg-card shadow-none",
          isPanel && "min-h-[min(560px,72vh)]",
          className,
        )}
      >
        <CardContent className={cn("p-3", isPanel && "min-h-[min(520px,70vh)]")}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t.adLabel}
          </p>
          <div className="ad-slot-html" dangerouslySetInnerHTML={{ __html: creative.html! }} />
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
        isPanel ? "min-h-[min(480px,65vh)]" : "h-auto",
      )}
      loading="lazy"
    />
  );

  return (
    <Card
      className={cn(
        "w-full border border-border bg-card shadow-none",
        isPanel && "min-h-[min(560px,72vh)]",
        className,
      )}
    >
      <CardContent className="p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t.adLabel}
        </p>
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
