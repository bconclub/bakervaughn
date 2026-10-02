"use client";

import { useEffect, useRef, useState } from "react";
import { offices } from "@/lib/content";
import { reducedMotion } from "@/lib/gsap";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Split-flap cell text: scrambles once when the board enters view, then settles.
function Flap({ text, delay, go }: { text: string; delay: number; go: boolean }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (!go || reducedMotion()) return;
    let frame = 0;
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      if (now < start) return (raf = requestAnimationFrame(tick));
      frame++;
      const settled = Math.floor(frame / 2);
      setShown(
        text
          .split("")
          .map((c, i) => (i < settled || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join(""),
      );
      if (settled < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, text, delay]);
  return <span aria-hidden>{shown}</span>;
}

function useClock(tz: string | null) {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    if (!tz) return;
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz });
    const update = () => setT(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 15000);
    return () => window.clearInterval(id);
  }, [tz]);
  return t;
}

function Row({ o, i, go }: { o: (typeof offices)[number]; i: number; go: boolean }) {
  const time = useClock(o.tz);
  return (
    <tr className="border-b border-line-soft">
      <td className="py-3 pr-4 text-text">
        <span className="sr-only">{o.city}</span>
        <Flap text={o.city.toUpperCase()} delay={i * 90} go={go} />
      </td>
      <td className={`py-3 pr-4 ${o.type.startsWith("[ADD") ? "text-text-3" : "text-text-2"}`}>{o.type.toUpperCase()}</td>
      <td className="py-3 text-right text-lamp tabular-nums">{time}</td>
    </tr>
  );
}

export default function OfficeBoard() {
  const ref = useRef<HTMLTableElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setGo(true), io.disconnect()), { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <table ref={ref} className="w-full border-t border-line-soft font-mono text-[13px] uppercase tracking-[0.06em]">
      <caption className="sr-only">Bakervaughn offices and local time</caption>
      <thead className="sr-only">
        <tr>
          <th>Office</th>
          <th>Type</th>
          <th>Local time</th>
        </tr>
      </thead>
      <tbody>
        {offices.map((o, i) => (
          <Row key={o.city} o={o} i={i} go={go} />
        ))}
      </tbody>
    </table>
  );
}
