"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SliderProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
};

function Slider({ className, value, min, max, step = 1, onValueChange, ...props }: SliderProps) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <input
      type="range"
      data-slot="slider"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange(Number(e.target.value))}
      style={{
        background: `linear-gradient(to right, var(--primary) ${percent}%, var(--muted) ${percent}%)`,
      }}
      className={cn(
        "h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
        "[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
        "[&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-background",
        "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150",
        "[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95",
        "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full",
        "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-background",
        "[&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-150",
        "[&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95",
        className,
      )}
      {...props}
    />
  );
}

export { Slider };
