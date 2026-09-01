import { useMemo } from "react";

/**
 * A Power BI–style categorical palette — literal hex, not CSS vars. Two
 * reasons: (1) it reads closer to Power BI's own default report theme than
 * this app's --chart-1..5 tokens, and (2) hex strings work as a plain SVG
 * `fill` attribute; a CSS var does not (recharts renders `fill` as a raw
 * presentation attribute, which the SVG spec never resolves custom
 * properties against — confirmed by hand this session, not a guess).
 */
const POWER_BI_PALETTE = [
  "#118DFF", // blue
  "#12239E", // dark blue
  "#E66C37", // orange
  "#6B007B", // purple
  "#E044A7", // pink
  "#744EC2", // violet
  "#D9B300", // gold
  "#D64550", // red
  "#197278", // teal
  "#4AC5BB", // aqua
];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A freshly shuffled copy of the palette, stable for the life of the
 * component but different on every page load/reload — an explicit request:
 * the dashboard shouldn't always paint the same category the same color. */
export function usePowerBiPalette(): string[] {
  return useMemo(() => shuffled(POWER_BI_PALETTE), []);
}
