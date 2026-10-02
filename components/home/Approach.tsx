"use client";

import { useRef, useState } from "react";
import { stages } from "@/lib/content";

// Four selectable stages with a geometric figure that fills in as work progresses.
function Figure({ active }: { active: number }) {
  const cells = 16;
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[360px]" aria-hidden>
      {Array.from({ length: cells }).map((_, i) => {
        const x = (i % 4) * 80;
        const y = Math.floor(i / 4) * 80;
        const lit = i < (active + 1) * 4;
        const row = Math.floor(i / 4);
        return (
          <rect
            key={i}
            x={x + 4}
            y={y + 4}
            width="72"
            height="72"
            rx="2"
            fill={lit ? (row === active ? "var(--lamp)" : "var(--surface)") : "transparent"}
            stroke={lit ? "var(--lamp)" : "var(--line)"}
            style={{
              transition: `fill .5s var(--ease-out) ${(i % 4) * 60}ms, stroke .5s var(--ease-out) ${(i % 4) * 60}ms`,
            }}
          />
        );
      })}
    </svg>
  );
}

export default function Approach() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = stages[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + stages.length) % stages.length;
    setActive(n);
    tabs.current[n]?.focus();
  };

  return (
    <section className="border-y border-line-soft bg-ground-deep py-20 md:py-28" aria-labelledby="approach-title">
      <div className="wrap">
        <p className="text-[0.95rem] text-text-2" data-reveal>
          How we work
        </p>
        <h2 id="approach-title" className="display mt-4 max-w-[16ch] text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
          Fix the one thing first. Then connect the rest.
        </h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <div role="tablist" aria-label="Stages" className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
              {stages.map((st, i) => (
                <button
                  key={st.key}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${st.key}`}
                  aria-selected={i === active}
                  aria-controls="stage-panel"
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`min-h-16 px-4 py-3 text-left transition-colors ${
                    i === active ? "bg-lamp text-ink" : "bg-ground-deep text-text-2 hover:text-text"
                  }`}
                >
                  <span className="block font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block font-semibold">{st.label}</span>
                </button>
              ))}
            </div>
            <div id="stage-panel" role="tabpanel" aria-labelledby={`tab-${s.key}`} className="mt-10 min-h-[12rem]" key={s.key}>
              <h3 className="text-3xl font-bold tracking-[-0.02em] [font-stretch:108%] md:text-4xl">{s.title}</h3>
              <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-text-2">{s.body}</p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Figure active={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
