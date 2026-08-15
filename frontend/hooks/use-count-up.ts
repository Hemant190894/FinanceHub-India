"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates from 0 (or the previous value) to `target` over `duration` ms
 * using an ease-out curve. Used for the single "hero" result number per
 * calculator — not a general-purpose effect.
 */
export function useCountUp(target: number | null, duration = 700): number {
  const [display, setDisplay] = useState(target ?? 0);
  const fromRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;

    const targetValue = target;
    const from = fromRef.current;
    const delta = targetValue - from;
    const start = performance.now();

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + delta * eased;
      setDisplay(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = targetValue;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return target === null ? 0 : display;
}
