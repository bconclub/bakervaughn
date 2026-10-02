"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, reducedMotion } from "@/lib/gsap";
import { flowSteps } from "@/lib/content";

// How it connects: five stages, lit in sequence as the row scrolls into view.
export default function ConnectMap() {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (reducedMotion() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".stage", {
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      });
      gsap.from(".stage-bar", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="connect" className="py-20 md:py-28" aria-labelledby="connect-title">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-[0.95rem] text-text-2">How it all connects</p>
            <h2 id="connect-title" className="display mt-4 max-w-[14ch] text-[clamp(2.4rem,5vw,4.5rem)]">
              First click to payroll. Nothing re-typed.
            </h2>
          </div>
          <p className="max-w-[42ch] text-lg leading-relaxed text-text-2 lg:justify-self-end">
            Each service works on its own. Connected, the data flows from one stage to the next without anyone typing it
            twice.
          </p>
        </div>

        <ol ref={ref} className="mt-14 grid gap-px overflow-hidden rounded-[4px] bg-line sm:grid-cols-2 lg:grid-cols-5">
          {flowSteps.map((f, i) => (
            <li key={f.title} className="stage relative flex min-h-[260px] flex-col bg-ground p-6 md:p-7">
              <span className="stage-bar absolute inset-x-0 top-0 h-[3px] bg-lamp" aria-hidden />
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-lamp">{String(i + 1).padStart(2, "0")}</span>
                {i < flowSteps.length - 1 && <ArrowRight size={18} className="text-text-3" aria-hidden />}
              </div>
              <h3 className="display mt-8 text-[2rem]">{f.title}</h3>
              <p className="mt-1 text-sm text-text-3">{f.service}</p>
              <p className="mt-auto pt-6 leading-relaxed text-text-2">{f.caption}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
