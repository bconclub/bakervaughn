"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "@/lib/gsap";
import { demoPrompts, tickets, type Ticket } from "@/lib/content";

type Printed = { key: number; t: Ticket; no: number };
const byId = (id: string) => tickets.find((t) => t.id === id)!;
const MAX = 3;
const EVERY = 4200;

function TicketCard({ p, fresh }: { p: Printed; fresh: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!fresh || !ref.current || reducedMotion()) return;
    const el = ref.current;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline();
    // Make room, slide the event in, then show the reply and its status.
    tl.from(el, { height: 0, marginBottom: 0, duration: 0.6, ease: "expo.out" })
      .from(q(".ticket"), { opacity: 0, y: -12, duration: 0.5, ease: "power2.out" }, "<0.1")
      .from(q(".reply"), { opacity: 0, y: 6, duration: 0.35, ease: "power2.out" }, ">0.2")
      .from(q(".stamp"), { opacity: 0, scale: 0.8, duration: 0.3, ease: "back.out(2)" }, ">0.1");
    return () => {
      tl.kill();
    };
  }, [fresh]);

  const { t } = p;
  return (
    <div ref={ref} className="overflow-hidden" style={{ marginBottom: 12 }}>
      <article className="ticket relative px-5 py-4 text-[14px] leading-relaxed md:px-6">
        <div className="flex items-center justify-between gap-3 text-xs text-text-3">
          <span className="truncate">{t.channel}</span>
          <span className="shrink-0 tabular-nums">{t.time}</span>
        </div>
        <p className="mt-2.5 text-[15px] text-text">“{t.message}”</p>
        <p className="reply mt-2.5 rounded-[4px] border-l-2 border-lamp bg-ground px-3 py-2 text-text-2">
          <span className="sr-only">Reply: </span>
          {t.reply}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-text-3">
            {t.service} · {t.outcome}
          </span>
          <span className="stamp shrink-0 rounded-full bg-lamp/15 px-2.5 py-0.5 text-xs font-semibold text-lamp">
            {t.stamp}
          </span>
        </div>
      </article>
    </div>
  );
}

export default function TicketRail() {
  const [printed, setPrinted] = useState<Printed[]>(() =>
    [byId("rtw"), byId("table"), byId("stock")].map((t, i) => ({ key: i, t, no: 144 + i })).reverse(),
  );
  const counter = useRef(3);
  const cursor = useRef(3);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const visible = useRef(true);

  const push = useCallback((t: Ticket) => {
    const n = counter.current++;
    setPrinted((list) => [{ key: n, t, no: 144 + n }, ...list].slice(0, MAX));
  }, []);

  const schedule = useCallback(() => {
    window.clearInterval(timer.current);
    if (reducedMotion()) return;
    timer.current = window.setInterval(() => {
      if (!visible.current || document.hidden) return;
      push(tickets[cursor.current++ % tickets.length]);
    }, EVERY);
  }, [push]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (box.current) io.observe(box.current);
    schedule();
    return () => {
      io.disconnect();
      window.clearInterval(timer.current);
    };
  }, [schedule]);

  const newest = printed[0]?.key;

  return (
    <div ref={box} className="relative">
      {/* Heat lamp + rail */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[130%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,oklch(79%_0.155_68/0.28),transparent_65%)]" />
      <div className="relative">
        <div className="flex items-center justify-between rounded-[2px] border border-line bg-surface px-4 py-3">
          <span className="text-sm text-text-2">Across your business</span>
          <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-lamp">
            <span className="size-2 animate-pulse rounded-full bg-lamp motion-reduce:animate-none" />
            Live 24/7
          </span>
        </div>
        <div
          className="mt-3 h-[410px] overflow-hidden md:h-[440px] [mask-image:linear-gradient(to_bottom,black_78%,transparent)]"
          aria-live="polite"
          aria-label="Sample events handled across a business"
        >
          {printed.map((p) => (
            <TicketCard key={p.key} p={p} fresh={p.key === newest && p.key >= 3} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-text-2">Run a sample event:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {demoPrompts.map((d) => (
            <button
              key={d.ticket}
              onClick={() => {
                push(byId(d.ticket));
                schedule();
              }}
              className="min-h-11 rounded-full border border-line px-4 text-sm text-text transition-colors hover:border-lamp"
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-3">
          Scripted preview · synthetic data
        </p>
      </div>
    </div>
  );
}
