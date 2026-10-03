"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/lib/gsap";
import type { HomeContent } from "@/lib/cms/home";

// Words light up under the lamp as you scroll through.
export default function Statement({ c }: { c: HomeContent["statement"] }) {
  const ref = useRef<HTMLElement>(null);
  const lead = c.headline.split(" ").filter(Boolean);
  const words = [...lead, ...c.highlight.split(" ").filter(Boolean)];

  useEffect(() => {
    if (reducedMotion() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".w",
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.3,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 70%", end: "center 45%", scrub: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="statement" className="border-y border-line-soft bg-ground-deep py-24 md:py-40" aria-label="What we believe">
      <div className="wrap">
        <p className="display max-w-[18ch] text-[clamp(2.8rem,8vw,6rem)]">
          {words.map((w, i) => (
            <span key={i} className={`w inline-block ${i >= lead.length ? "text-lamp" : ""}`}>
              {w}&nbsp;
            </span>
          ))}
        </p>
        <p className="mt-10 max-w-[40ch] text-xl leading-relaxed text-text-2">
          {c.body}
        </p>
      </div>
    </section>
  );
}
