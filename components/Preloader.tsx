"use client";

import { useEffect, useRef, useState } from "react";
import { BAND, LEFT, RIGHT } from "@/components/BrandLogo";

// Loading screen: the mark keeps assembling in a loop while the bar tracks
// real readiness (fonts + window load), then the screen lifts away.
// A CSS failsafe removes it if scripts never run.
const MIN_MS = 1400;

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const started = useRef(0);

  useEffect(() => {
    started.current = performance.now();
    document.documentElement.style.overflow = "hidden";

    // Timer-driven (not rAF) so it still completes in a background tab.
    // Time-based easing keeps the pace right even when timers are throttled.
    let target = 0.15;
    let cur = 0;
    let last = performance.now();
    let finished = false;
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(1, (now - last) / 1000);
      last = now;
      if (!finished) target = Math.min(0.9, target + dt * 0.09);
      cur += (target - cur) * (1 - Math.exp(-dt * 7));
      setProgress(cur);
      if (finished && cur > 0.995) {
        window.clearInterval(id);
        setProgress(1);
        setDone(true);
      }
    }, 16);

    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => (target = Math.max(target, 0.6)));
    const loaded = new Promise<void>((r) =>
      document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }),
    );
    Promise.all([fonts, loaded]).then(() => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started.current));
      window.setTimeout(() => {
        finished = true;
        target = 1;
      }, wait);
    });

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!done) return;
    window.__bvReady = true;
    window.dispatchEvent(new Event("bv:ready"));
    document.documentElement.style.overflow = "";
    const t = window.setTimeout(() => setGone(true), 900);
    return () => window.clearTimeout(t);
  }, [done]);

  if (gone) return null;

  return (
    <div
      className={`preloader fixed inset-0 z-[100] grid place-items-center bg-ground transition-[clip-path,opacity] duration-[900ms] ease-[cubic-bezier(0.7,0,0.2,1)] ${
        done ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(0_0_0_0)]"
      }`}
      role="status"
      aria-label="Loading Baker Vaughn"
    >
      <div className={`flex flex-col items-center transition-opacity duration-300 ${done ? "opacity-0" : "opacity-100"}`}>
        <svg viewBox="0 0 358 234" className={`h-auto w-[92px] text-text sm:w-[112px] ${done ? "pl-hold" : ""}`} fill="currentColor" aria-hidden>
          <path d={LEFT} className="pl-piece" style={{ animationDelay: "0s" }} />
          <path d={BAND} className="pl-piece" style={{ animationDelay: "0.12s" }} />
          <path d={RIGHT} className="pl-piece pl-accent" style={{ animationDelay: "0.24s" }} />
        </svg>
        <div className="mt-9 h-[2px] w-[180px] overflow-hidden rounded-full bg-white/10 sm:w-[220px]">
          <div className="h-full origin-left rounded-full bg-lamp" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  );
}
