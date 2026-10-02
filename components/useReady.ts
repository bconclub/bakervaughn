"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __bvReady?: boolean;
  }
}

// True once the loading screen starts lifting ("bv:ready"). Falls back after
// a few seconds so nothing waits forever if the loader never runs.
export function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.__bvReady) return setReady(true);
    const on = () => setReady(true);
    window.addEventListener("bv:ready", on, { once: true });
    const t = window.setTimeout(on, 6000);
    return () => {
      window.removeEventListener("bv:ready", on);
      window.clearTimeout(t);
    };
  }, []);
  return ready;
}
