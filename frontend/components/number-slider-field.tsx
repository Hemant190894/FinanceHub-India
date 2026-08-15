"use client";

import { useRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/components/providers/language-provider";
import { playTick } from "@/lib/sound";
import { cn } from "@/lib/utils";

const TICK_COUNT = 40;

type NumberSliderFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  inputMode?: "numeric" | "decimal";
  placeholder?: string;
  helper?: React.ReactNode;
  className?: string;
};

export function NumberSliderField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  inputMode = "numeric",
  placeholder,
  helper,
  className,
}: NumberSliderFieldProps) {
  const { t } = useLanguage();
  const numeric = Number(value);
  const sliderValue = Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : min;
  const tickSize = (max - min) / TICK_COUNT || 1;
  const lastBucket = useRef(Math.floor((sliderValue - min) / tickSize));

  function handleSliderChange(next: number) {
    const bucket = Math.floor((next - min) / tickSize);
    if (bucket !== lastBucket.current) {
      lastBucket.current = bucket;
      playTick(max > min ? (next - min) / (max - min) : 0);
    }
    onChange(String(next));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <Slider
        aria-label={label}
        value={sliderValue}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        className="mt-1"
      />
      {helper ?? <p className="text-xs text-muted-foreground">{t.sliderHint}</p>}
    </div>
  );
}
