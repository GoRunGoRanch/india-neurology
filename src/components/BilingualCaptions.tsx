"use client";

import { useEffect } from "react";

const DEVANAGARI = /[ऀ-ॿ]/;
const SKIP = new Set(["SCRIPT", "STYLE", "TITLE", "OPTION", "TEXTAREA", "INPUT", "SELECT", "NOSCRIPT"]);

/**
 * Hindi pages: shows the English for every Hindi line underneath it. Each element whose own text is
 * made of known Hindi strings gets a data-en attribute, rendered by CSS as a caption (globals.css).
 * Attributes only — the DOM React manages is never restructured.
 */
export function BilingualCaptions({ pairs }: { pairs: [string, string][] }) {
  useEffect(() => {
    const exact = new Map(pairs);
    // Longest first, so whole sentences are replaced before the words inside them.
    const byLength = [...pairs].filter(([h]) => h.length > 1).sort((a, b) => b[0].length - a[0].length);

    const english = (text: string) => {
      const hit = exact.get(text);
      if (hit) return hit;
      let rest = text;
      for (const [h, e] of byLength) if (rest.includes(h)) rest = rest.split(h).join(e);
      // Only caption text that is fully covered by known strings; never show a half translation.
      return DEVANAGARI.test(rest) ? null : rest;
    };

    const apply = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node as HTMLElement;
        if (SKIP.has(el.tagName) || el.closest("[data-no-en]")) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent ?? "").join("").replace(/\s+/g, " ").trim();
        if (!own || !DEVANAGARI.test(own)) {
          if (el.dataset.en) delete el.dataset.en;
          continue;
        }
        const en = english(own);
        if (en && el.dataset.en !== en) el.dataset.en = en;
        else if (!en && el.dataset.en) delete el.dataset.en;
      }
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };
    apply();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pairs]);
  return null;
}
