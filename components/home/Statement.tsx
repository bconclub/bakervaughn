"use client";

import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "@/lib/gsap";

const WORDS = "Your whole business, running on one system.".split(" ");

// Words light up under the lamp as you scroll through.
export default function Statement() {
  const ref = useRef<HTMLElement>(null);

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
    <section ref={ref} className="border-y border-line-soft bg-ground-deep py-24 md:py-40" aria-label="What we believe">
      <div className="wrap">
        <p className="display max-w-[18ch] text-[clamp(2.8rem,8vw,6rem)]">
          {WORDS.map((w, i) => (
            <span key={i} className={`w inline-block ${i >= WORDS.length - 2 ? "text-lamp" : ""}`}>
              {w}&nbsp;
            </span>
          ))}
        </p>
        <p className="mt-10 max-w-[40ch] text-xl leading-relaxed text-text-2">
          Calls, enquiries, stock, staff and accounts, connected. Nothing re-typed, nothing missed.
        </p>
      </div>
    </section>
  );
}
