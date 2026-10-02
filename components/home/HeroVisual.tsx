"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Check, PackageCheck, PhoneCall, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/BrandLogo";
import { reducedMotion } from "@/lib/gsap";
import { useReady } from "@/components/useReady";

// Product collage: every part of the system shown working together.
// Mockup data is illustrative.
const glass =
  "rounded-2xl border border-white/10 bg-[oklch(21%_0.008_60/0.78)] shadow-[0_24px_60px_-24px_oklch(0%_0_0/0.85)] backdrop-blur-xl";

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.06em] text-text-3 uppercase">
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

// Desktop cards can be dragged, clicked to the front and double-clicked home.
const InteractiveCtx = createContext({ on: false, scale: 1 });
let topZ = 40;

// depth: how far (px) the card drifts with the cursor. Nearer cards move more.
// i: order in the intro, where cards pop in one after another.
function Float({
  className,
  delay = 0,
  depth = 12,
  i = 0,
  children,
}: {
  className: string;
  delay?: number;
  depth?: number;
  i?: number;
  children: React.ReactNode;
}) {
  const { on: interactive, scale } = useContext(InteractiveCtx);
  const outer = useRef<HTMLDivElement>(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    if (!interactive || e.pointerType !== "mouse" || e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    start.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y, moved: false };
    if (outer.current) outer.current.style.zIndex = String(++topZ);
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    // the stage may be scaled down; convert screen px to stage px
    const dx = (e.clientX - s.x) / scale;
    const dy = (e.clientY - s.y) / scale;
    if (Math.abs(dx) + Math.abs(dy) > 3) s.moved = true;
    // Keep the card inside the stage: an invisible canvas it can't leave.
    const el = outer.current!;
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    setOff({
      x: clamp(s.ox + dx, -el.offsetLeft, STAGE_W - el.offsetWidth - el.offsetLeft),
      y: clamp(s.oy + dy, -el.offsetTop, STAGE_H - el.offsetHeight - el.offsetTop),
    });
  };
  const onUp = () => {
    start.current = null;
    setDragging(false);
  };

  return (
    <div
      ref={outer}
      className={`absolute transition-transform duration-700 ease-out ${className}`}
      style={{ transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)` }}
    >
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={() => interactive && setOff({ x: 0, y: 0 })}
        className={`h-full ${interactive ? (dragging ? "cursor-grabbing select-none" : "cursor-grab select-none") : ""}`}
        style={{
          transform: `translate3d(${off.x}px, ${off.y}px, 0) scale(${dragging ? 1.03 : 1})`,
          transition: dragging ? "transform 0.12s ease-out" : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
          filter: dragging ? "drop-shadow(0 30px 40px oklch(0% 0 0 / 0.55))" : undefined,
        }}
      >
        <div className="card-enter h-full" style={{ "--i": i } as React.CSSProperties}>
          <div className="float h-full" style={{ animationDelay: `${delay}s` }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const chat = [
  { me: false, text: "Hi, can I book a consultation this Thursday?" },
  { me: true, text: "Yes! 10:00am or 2:30pm are free. Which suits you?" },
  { me: false, text: "2:30 please" },
  { me: true, text: "Booked ✓ Thursday 2:30pm. Confirmation sent by text." },
];

function Phone() {
  return (
    <div className="h-full rounded-[34px] border border-white/15 bg-[#0d0c0b] p-2 shadow-[0_30px_80px_-20px_oklch(0%_0_0/0.9)]">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[27px] bg-[oklch(19%_0.008_60)]">
        <div className="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
        <div className="flex items-center gap-2 border-b border-white/5 px-3 pt-9 pb-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-text text-ink">
            <LogoMark className="h-3 w-auto" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-text">AI customer agent</p>
            <p className="text-[10px] text-[#4ade80]">● replies in 3s</p>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden p-2.5">
          {chat.map((m, i) => (
            <p
              key={i}
              className={`msg max-w-[84%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug ${
                m.me ? "self-start rounded-bl-md bg-white/[0.07] text-text" : "self-end rounded-br-md bg-lamp text-ink"
              }`}
              style={{ animationDelay: `${0.5 + i * 0.9}s` }}
            >
              {m.text}
            </p>
          ))}
          <div className="msg flex gap-1 self-start rounded-2xl bg-white/[0.07] px-3 py-2" style={{ animationDelay: "4.2s" }}>
            {[0, 1, 2].map((d) => (
              <span key={d} className="typing size-1 rounded-full bg-text-3" style={{ animationDelay: `${d * 0.15}s` }} />
            ))}
          </div>
        </div>
        <div className="m-2 mt-0 rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-text-3">Message…</div>
      </div>
    </div>
  );
}

const bars = [38, 62, 45, 80, 55, 92, 70];

function VoiceCard() {
  return (
    <div className={`${glass} p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Tag color="#2dd4bf">Dialgen.AI · Calls</Tag>
        <span className="flex items-center gap-1.5 text-[11px] text-[#f87171]">
          <span className="live size-1.5 rounded-full bg-[#f87171]" /> Live · 0:42
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#2dd4bf]/15 text-[#2dd4bf]">
          <PhoneCall size={15} />
        </span>
        <div className="flex h-8 min-w-0 flex-1 items-center gap-[3px]">
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="wave min-w-0 flex-1 rounded-full bg-[#2dd4bf]"
              style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i % 7) * 0.11}s` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2.5 text-[13px] leading-snug text-text-2">“Can I move my appointment to 3pm?”</p>
      <p className="mt-1 text-[13px] leading-snug text-text">Done. Moved to 3:00pm, confirmation sent.</p>
    </div>
  );
}

function StockCard() {
  return (
    <div className={`${glass} flex items-start gap-2.5 p-3`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#4ade80]/15 text-[#4ade80]">
        <PackageCheck size={16} />
      </span>
      <div className="min-w-0">
        <Tag color="#4ade80">ERP · Stock</Tag>
        <p className="mt-1 text-[13px] leading-snug text-text">SKU A-104 running low</p>
        <p className="text-[11px] leading-snug text-text-3">Reorder sent to supplier automatically</p>
      </div>
    </div>
  );
}

function PayrollCard() {
  return (
    <div className={`${glass} p-4`}>
      <Tag color="#60a5fa">HR · Payroll</Tag>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-[-0.02em] text-text">£48,210</p>
        <p className="text-[11px] text-text-3">32 staff</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="fill h-full rounded-full bg-[#60a5fa]" />
      </div>
      <ul className="mt-2.5 space-y-1 text-[12px] text-text-2">
        {["Right-to-work checked 32/32", "Pension submitted", "Payslips sent"].map((t) => (
          <li key={t} className="flex items-center gap-1.5">
            <Check size={12} className="shrink-0 text-[#4ade80]" /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataCard() {
  return (
    <div className={`${glass} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <Tag color="#a78bfa">Data</Tag>
        <span className="rounded-full bg-[#4ade80]/15 px-2 py-0.5 text-[11px] font-medium text-[#4ade80]">+18%</span>
      </div>
      <p className="mt-2 text-[12px] text-text-3">Revenue this week</p>
      <p className="text-2xl font-bold tracking-[-0.02em] text-text">£18,940</p>
      <div className="mt-3 flex h-14 items-end gap-1.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className="bar flex-1 rounded-t-[4px] bg-gradient-to-t from-[#a78bfa]/40 to-[#a78bfa]"
            style={{ height: `${h}%`, animationDelay: `${0.3 + i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function Backdrop() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(closest-side,black,transparent)] [background-image:linear-gradient(to_right,oklch(100%_0_0/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(100%_0_0/0.05)_1px,transparent_1px)] [background-size:36px_36px]"
      />
      <div aria-hidden className="absolute inset-[15%] rounded-full bg-[radial-gradient(closest-side,oklch(79%_0.155_68/0.22),transparent)] blur-3xl" />
    </>
  );
}

// One stage, designed at 620x640. Narrower screens get the same composition
// scaled down, so mobile is a true miniature of desktop.
const STAGE_W = 620;
const STAGE_H = 640;

export default function HeroVisual() {
  const ready = useReady();
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const el = box.current!;
    setFine(matchMedia("(pointer: fine)").matches);
    setScale(Math.min(1, el.clientWidth / STAGE_W)); // measure now; the observer keeps it current
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / STAGE_W)));
    ro.observe(el);
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
      });
    };
    if (!reducedMotion()) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={box} className="relative mx-auto aspect-[620/640] w-full max-w-[620px]">
      <div className="absolute top-0 left-0 origin-top-left" style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale ?? 1})`,
          opacity: scale === null ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <InteractiveCtx.Provider value={{ on: fine && (scale ?? 0) >= 0.7, scale: scale ?? 1 }}>
          <div className={`h-full ${ready ? "cards-go" : "cards-wait"}`}>
            <DesktopCollage />
          </div>
        </InteractiveCtx.Provider>
      </div>
    </div>
  );
}

function DesktopCollage() {
  return (
    <div className="relative h-full w-full">
      <Backdrop />
      <Float className="top-[8%] left-0 z-20 h-[480px] w-[236px]" delay={0.4} depth={10} i={0}>
        <Phone />
      </Float>
      <Float className="top-0 right-0 z-30 w-[300px]" depth={22} i={1}>
        <VoiceCard />
      </Float>
      <Float className="top-[24%] left-[31%] z-30 w-[236px]" delay={1.2} depth={30} i={2}>
        <StockCard />
      </Float>
      <Float className="top-[41%] right-0 z-20 w-[250px]" delay={0.8} depth={16} i={3}>
        <PayrollCard />
      </Float>
      <Float className="right-[5%] bottom-0 z-30 w-[262px]" delay={1.6} depth={26} i={4}>
        <DataCard />
      </Float>
      <Float className="bottom-[2%] left-[2%] z-30" delay={2} depth={34} i={5}>
        <div className={`${glass} flex items-center gap-2 rounded-full py-2 pr-4 pl-2`}>
          <span className="grid size-7 place-items-center rounded-full bg-lamp/15 text-lamp">
            <Sparkles size={14} />
          </span>
          <span className="text-[12px] text-text">
            New lead from Instagram <span className="text-text-3">· qualified</span>
          </span>
        </div>
      </Float>
    </div>
  );
}
