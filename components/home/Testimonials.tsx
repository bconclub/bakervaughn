import { Play, Star } from "lucide-react";
import type { Testimonial } from "@/lib/collections/read";

// Accepts youtu.be, watch?v=, /embed/ and /shorts/ links, or a bare 11-character id.
function youtubeId(url: string | null) {
  if (!url) return null;
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1] ?? null;
}

function Stars({ n }: { n: number }) {
  return (
    <p className="flex gap-0.5 text-lamp" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} className={i < n ? "fill-current" : "opacity-25"} aria-hidden />
      ))}
    </p>
  );
}

function Author({ t }: { t: Testimonial }) {
  const initials = t.author_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="flex items-center gap-3">
      {t.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- photos uploaded from /admin
        <img src={t.photo_url} alt="" loading="lazy" className="size-11 rounded-full object-cover" />
      ) : (
        <span className="grid size-11 place-items-center rounded-full bg-surface font-semibold text-text-2" aria-hidden>
          {initials}
        </span>
      )}
      <div className="leading-tight">
        <p className="font-semibold">{t.author_name}</p>
        {(t.author_role || t.company) && (
          <p className="mt-0.5 text-sm text-text-3">{[t.author_role, t.company].filter(Boolean).join(", ")}</p>
        )}
      </div>
    </div>
  );
}

// Published testimonials from /admin. Renders nothing until there's at least one.
export default function Testimonials({ items }: { items: Testimonial[] | null }) {
  const list = (items ?? []).filter((t) => (t.kind === "video" ? youtubeId(t.video_url) : t.quote));
  if (list.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 md:py-28" aria-labelledby="testimonials-title">
      <div className="wrap">
        <p className="text-[0.95rem] text-text-2" data-reveal>
          In their words
        </p>
        <h2 id="testimonials-title" className="display mt-4 max-w-[16ch] text-[clamp(2.4rem,5vw,4.5rem)]" data-reveal>
          What our clients say.
        </h2>

        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => {
            const vid = t.kind === "video" ? youtubeId(t.video_url) : null;
            return (
              <li key={t.id} data-reveal className="flex flex-col rounded-2xl border border-line bg-surface/60 p-6 md:p-7">
                {vid ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${vid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-video overflow-hidden rounded-xl bg-ground"
                    aria-label={`Watch ${t.author_name}'s video on YouTube`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail */}
                    <img
                      src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid size-14 place-items-center rounded-full bg-lamp text-ink shadow-lg transition-transform group-hover:scale-110">
                        <Play size={22} className="ml-0.5 fill-current" aria-hidden />
                      </span>
                    </span>
                  </a>
                ) : (
                  <span className="display text-[3.5rem] leading-[0.6] text-lamp" aria-hidden>
                    &ldquo;
                  </span>
                )}
                {t.rating ? (
                  <div className="mt-5">
                    <Stars n={t.rating} />
                  </div>
                ) : null}
                {t.quote && <blockquote className="mt-4 text-lg leading-relaxed text-text">{t.quote}</blockquote>}
                <div className="mt-auto pt-6">
                  <Author t={t} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
