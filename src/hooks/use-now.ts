"use client";

import { useCallback, useSyncExternalStore } from "react";

// The current time, rounded down to `step` ms and re-read every `step`.
// The server snapshot is null, so countdowns and "5 min ago" render only on
// the client and never cause a hydration mismatch.
export function useNow(step = 30_000): number | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const timer = window.setInterval(onChange, step);
      return () => window.clearInterval(timer);
    },
    [step],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / step) * step,
    () => null,
  );
}
