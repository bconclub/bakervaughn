import { beliefs, labs } from "@/lib/content";

export function Labs() {
  return (
    <section id="labs" className="py-20 md:py-28" aria-labelledby="labs-title">
      <div className="wrap grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-[0.95rem] text-text-2" data-reveal>
            Bakervaughn Labs
          </p>
          <h2 id="labs-title" className="display mt-4 text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
            AI you can touch.
          </h2>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-text-2" data-reveal>
            Side builds that started as “what if” conversations. Some graduate into products.
          </p>
        </div>
        <ul className="border-t border-line">
          {labs.map((l) => (
            <li key={l.name} data-reveal className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line py-6">
              <div>
                <p className="text-xl font-bold tracking-[-0.015em] md:text-2xl">{l.name}</p>
                <p className="mt-1 text-text-2">{l.line}</p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-lamp">In R&amp;D</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Beliefs() {
  return (
    <section className="bg-paper py-20 text-ink md:py-28" aria-labelledby="beliefs-title">
      <div className="wrap">
        <h2 id="beliefs-title" className="display max-w-[14ch] text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
          Why businesses pick us.
        </h2>
        <ol className="mt-14 grid gap-x-12 border-t border-ink/20 md:grid-cols-2">
          {beliefs.map((b, i) => (
            <li key={b.title} data-reveal className="grid grid-cols-[3rem_1fr] border-b border-ink/20 py-8">
              <span className="font-mono text-sm text-ink-2">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em]">{b.title}</h3>
                <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-ink-2">{b.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
