"use client";

import { useEffect, useRef } from "react";
import EnquiryButton from "@/components/enquiry/EnquiryButton";
import { ClientLogos } from "@/components/Logos";

import HeroVisual from "./HeroVisual";
import type { HomeContent } from "@/lib/cms/home";

// The lamp light eases after the cursor. On touch it rests behind the collage.
function useCursorLight(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    // Light only, no content moves, so it runs regardless of reduced motion.
    if (!el) return;
    const target = { x: 0.72, y: 0.42 };
    const cur = { ...target };
    let raf = 0;
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      el.style.setProperty("--mx", `${(cur.x * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(cur.y * 100).toFixed(2)}%`);
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      if (e.clientY > r.bottom) return;
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

export default function Hero({ c }: { c: HomeContent["hero"] }) {
  const ref = useRef<HTMLElement>(null);
  useCursorLight(ref);
  return (
    <section ref={ref} id="top" className="relative overflow-hidden">
      {/* lamp light that follows the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_640px_at_var(--mx,72%)_var(--my,42%),oklch(79%_0.155_68/0.24),transparent_70%)]"
      />
      <div className="wrap relative grid min-h-[min(100svh,960px)] items-center gap-6 pt-[96px] pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16">
        <div className="relative z-10" data-scroll-out>
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-text-2">
            <span className="size-1.5 rounded-full bg-lamp" aria-hidden />
            {c.eyebrow}
          </p>
          <h1 className="display mt-7 text-[clamp(2.75rem,6vw,5.5rem)]">
            {c.headline} <span className="text-lamp">{c.headlineAccent}</span>
          </h1>
          <p className="mt-7 max-w-[48ch] text-lg leading-relaxed text-text-2 md:text-xl">
            {c.intro}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <EnquiryButton source="hero">{c.ctaLabel}</EnquiryButton>
            <a href="#connect" className="text-base text-text-2 underline-offset-4 hover:text-text hover:underline">
              {c.secondaryLabel}
            </a>
          </div>
        </div>

        <div className="relative mt-4 lg:mt-0">
          <HeroVisual />
        </div>
      </div>

      <div className="wrap relative pb-14">
        <div className="flex flex-col gap-6 border-t border-line-soft pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[34ch] shrink-0 text-sm text-text-2">{c.trustedLabel}</p>
          <ClientLogos clients={c.clients} />
        </div>
      </div>
    </section>
  );
}
