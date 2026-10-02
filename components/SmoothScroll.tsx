"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion } from "@/lib/gsap";

// Wrap every word of a heading in a clipping mask so it can rise into view.
// Walks child elements too, so coloured spans inside a heading keep their styling.
function splitWords(root: HTMLElement) {
  const words: HTMLElement[] = [];
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(part);
          const mask = document.createElement("span");
          mask.className = "split-mask";
          const word = document.createElement("span");
          word.className = "split-word";
          word.textContent = part;
          mask.append(word);
          frag.append(mask);
          words.push(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(root);
  return words;
}

// Lenis drives the scroll, GSAP's ticker drives Lenis, ScrollTrigger listens.
// Owns the page-wide motion: [data-reveal] entrances, word-by-word section
// headings, [data-parallax] drift and the hero's [data-scroll-out] exit.
export default function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;

    const lenis = new Lenis({ anchors: { offset: -72 }, lerp: 0.085, wheelMultiplier: 0.9, syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Section headings: words rise out of their masks.
      document.querySelectorAll<HTMLElement>("main section h2.display").forEach((h) => {
        h.removeAttribute("data-reveal");
        gsap.set(h, { opacity: 1, y: 0 });
        // Split once; a remount reuses the existing masks.
        const words = h.dataset.split
          ? [...h.querySelectorAll<HTMLElement>(".split-word")]
          : splitWords(h);
        h.dataset.split = "1";
        gsap.from(words, {
          yPercent: 110,
          duration: 1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: h, start: "top 85%", once: true },
        });
      });

      // Parallax: value is the drift in px either side of centre.
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const d = Number(el.dataset.parallax) || 30;
        gsap.fromTo(
          el,
          { y: d },
          { y: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      // Hero copy eases up and fades as the page scrolls past it.
      document.querySelectorAll<HTMLElement>("[data-scroll-out]").forEach((el) => {
        gsap.to(el, {
          y: -70,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top+=80", end: "bottom top", scrub: true },
        });
      });
    });

    const batch = ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }),
    });

    return () => {
      batch.forEach((t) => t.kill());
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
