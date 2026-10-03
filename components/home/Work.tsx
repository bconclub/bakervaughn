import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { HomeContent } from "@/lib/cms/home";

// Paper section. Each project is a docket: challenge / what we did / outcome.
export default function Work({ c }: { c: HomeContent["work"] }) {
  return (
    <section id="work" className="bg-paper py-20 text-ink md:py-28" aria-labelledby="work-title">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 id="work-title" className="display max-w-[12ch] text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
            {c.title}
          </h2>
          <a href="#work" className="group inline-flex items-center gap-2 text-base underline-offset-4 hover:underline" data-reveal>
            {c.linkLabel}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-14 border-t border-ink/20">
          {c.projects.map((w, i) => (
            <article key={i} data-reveal className="grid gap-8 border-b border-ink/20 py-10 lg:grid-cols-[0.9fr_1.6fr] lg:gap-16 lg:py-14">
              <div>
                <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.06em] text-ink-2">
                  <span>Project {String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden>·</span>
                  <span>{w.kind}</span>
                </div>
                <h3 className="display mt-4 text-[clamp(2.2rem,4vw,3.5rem)]">{w.name}</h3>
                <p className="mt-2 text-ink-2">{w.client}</p>
                <div className="relative mt-6 aspect-[4/3] max-w-md overflow-hidden rounded-[4px] bg-paper-shade">
                  {w.image && (
                    // Images added from /admin may live on any host, so only local ones go through the optimiser.
                    <Image
                      src={w.image}
                      alt={w.alt}
                      fill
                      sizes="(min-width: 1024px) 28rem, 100vw"
                      unoptimized={!w.image.startsWith("/")}
                      className="scale-[1.18] object-cover"
                      data-parallax="28"
                    />
                  )}
                  <span className="absolute bottom-2 left-2 rounded-full bg-paper/90 px-2 py-0.5 font-mono text-[10px] text-ink-2">
                    Stock photo · [ADD PROJECT PHOTO]
                  </span>
                </div>
              </div>
              <div>
                <p className="max-w-[26ch] text-2xl font-semibold leading-snug tracking-[-0.015em] md:text-3xl">{w.title}</p>
                <dl className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
                  {(
                    [
                      ["The challenge", w.challenge],
                      ["What we did", w.did],
                      ["The outcome", w.outcome],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="border-t border-ink/20 pt-4">
                      <dt className="text-sm font-semibold">{k}</dt>
                      <dd className={`mt-2 text-base leading-relaxed ${v.startsWith("[ADD") ? "font-mono text-sm text-docket" : "text-ink-2"}`}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <a href="#work" className="group mt-8 inline-flex min-h-11 items-center gap-2 text-base font-semibold underline-offset-4 hover:underline">
                  Read the case study
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
