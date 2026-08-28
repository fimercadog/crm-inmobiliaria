"use client";

import { useEffect } from "react";

const SELECTOR = ".realty-animate-fade-up, .realty-animate-fade-in, .realty-animate-scale-in";

/**
 * Mounted once in the public layout. Watches every element carrying one of
 * the realty-animate-* classes and adds .is-visible the first time it
 * scrolls into view — see the matching CSS in globals.css for why this
 * exists (those classes used to run as plain CSS animations that fired on
 * mount, finishing invisibly before anyone scrolled to them).
 */
export function ScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll(SELECTOR);
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
