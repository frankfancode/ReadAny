/**
 * Reader theme colors and override styles for EPUB/HTML documents.
 * Ensures sidebars, callouts, cards, tables, and other authored containers
 * adapt gracefully to dark and sepia modes instead of glaring white.
 */

export type ReaderTheme = "light" | "dark" | "sepia";

export interface ReaderThemeColors {
  bg: string;
  fg: string;
  link: string;
  card: string;
  cardFg: string;
  border: string;
  muted: string;
  zebra: string;
}

export const READER_THEME_COLORS: Record<ReaderTheme, ReaderThemeColors> = {
  light: {
    bg: "#ffffff",
    fg: "#1a1a1a",
    link: "#2563eb",
    card: "#f8f9fa",
    cardFg: "#1a1a1a",
    border: "#e5e7eb",
    muted: "#f1f5f9",
    zebra: "rgba(0, 0, 0, 0.03)",
  },
  dark: {
    bg: "#121212",
    fg: "#f5f5f5",
    link: "#60a5fa",
    card: "#1e1e1e",
    cardFg: "#f5f5f5",
    border: "#333333",
    muted: "#2a2a2a",
    zebra: "rgba(255, 255, 255, 0.04)",
  },
  sepia: {
    bg: "#f0e6d2",
    fg: "#3d2b1f",
    link: "#6b4c2a",
    card: "#f5ebd7",
    cardFg: "#3d2b1f",
    border: "#d4c4a8",
    muted: "#e6d9c3",
    zebra: "rgba(61, 43, 31, 0.04)",
  },
};

export function getReaderThemeColors(theme: ReaderTheme): ReaderThemeColors {
  return READER_THEME_COLORS[theme] || READER_THEME_COLORS.dark;
}

/**
 * Builds CSS overrides for dark and sepia modes so that callouts, sidebars,
 * table zebra rows, and hardcoded bright backgrounds match the active theme.
 */
export function buildThemeOverrideCss(
  theme: ReaderTheme,
  customColors?: Partial<ReaderThemeColors>,
): string {
  const colors: ReaderThemeColors = {
    ...getReaderThemeColors(theme),
    ...customColors,
  };

  if (theme === "dark") {
    return `
/* ── Dark mode container & card overrides ── */
aside,
div.sidebar,
.sidebar,
aside[data-type="sidebar"],
[data-type="sidebar"],
[epub\\:type~="sidebar"],
div.callout,
.callout,
[data-type="callout"],
div.note,
.note,
[data-type="note"],
[epub\\:type~="note"],
div.tip,
.tip,
[data-type="tip"],
[epub\\:type~="tip"],
div.warning,
.warning,
[data-type="warning"],
[epub\\:type~="warning"],
div.caution,
.caution,
[data-type="caution"],
[epub\\:type~="caution"],
div.important,
.important,
[data-type="important"],
[epub\\:type~="important"],
.infobox,
.boxedtext,
.boxed-text,
.card {
  background-color: ${colors.card} !important;
  border-color: ${colors.border} !important;
  color: ${colors.cardFg} !important;
  box-sizing: border-box !important;
  max-width: 100% !important;
}

aside:has(.sidebar) {
  background-color: transparent !important;
  border: none !important;
}

.sidebar h1, .sidebar h2, .sidebar h3, .sidebar h4, .sidebar h5, .sidebar h6,
aside h1, aside h2, aside h3, aside h4, aside h5, aside h6,
[data-type="sidebar"] h1, [data-type="sidebar"] h2, [data-type="sidebar"] h3,
div.callout h1, div.callout h2, div.callout h3,
div.note h1, div.note h2, div.note h3,
div.tip h1, div.tip h2, div.tip h3 {
  color: ${colors.cardFg} !important;
}

h1, h2, h3, h4, h5, h6 {
  border-color: ${colors.border} !important;
}

table {
  border-color: ${colors.border} !important;
}
tr:nth-of-type(even),
tr:nth-child(even) {
  background-color: ${colors.zebra} !important;
}
th, td {
  border-color: ${colors.border} !important;
}

div.index h3 {
  background-color: ${colors.card} !important;
  color: ${colors.cardFg} !important;
}

pre code.hll {
  background-color: rgba(234, 179, 8, 0.25) !important;
  color: #fef08a !important;
}
pre code.gd {
  background-color: rgba(239, 68, 68, 0.25) !important;
  color: #fca5a5 !important;
}
pre code.gi {
  background-color: rgba(34, 197, 94, 0.25) !important;
  color: #86efac !important;
}

*[style*="background: #fff"],
*[style*="background:#fff"],
*[style*="background: #FFF"],
*[style*="background:#FFF"],
*[style*="background: white"],
*[style*="background-color: #fff"],
*[style*="background-color:#fff"],
*[style*="background-color: #FFF"],
*[style*="background-color:#FFF"],
*[style*="background-color: white"],
*[style*="background-color: rgb(255, 255, 255)"],
*[style*="background-color: rgb(255,255,255)"],
*[style*="background-color: #f7f7f7"],
*[style*="background-color:#f7f7f7"],
*[style*="background-color: #F7F7F7"],
*[style*="background-color:#F7F7F7"] {
  background-color: ${colors.card} !important;
  color: ${colors.cardFg} !important;
}
`;
  }

  if (theme === "sepia") {
    return `
/* ── Sepia mode container & card overrides ── */
aside,
div.sidebar,
.sidebar,
aside[data-type="sidebar"],
[data-type="sidebar"],
[epub\\:type~="sidebar"],
div.callout,
.callout,
[data-type="callout"],
div.note,
.note,
[data-type="note"],
[epub\\:type~="note"],
div.tip,
.tip,
[data-type="tip"],
[epub\\:type~="tip"],
div.warning,
.warning,
[data-type="warning"],
[epub\\:type~="warning"],
div.caution,
.caution,
[data-type="caution"],
[epub\\:type~="caution"],
div.important,
.important,
[data-type="important"],
[epub\\:type~="important"],
.infobox,
.boxedtext,
.boxed-text,
.card {
  background-color: ${colors.card} !important;
  border-color: ${colors.border} !important;
  color: ${colors.cardFg} !important;
  box-sizing: border-box !important;
  max-width: 100% !important;
}

aside:has(.sidebar) {
  background-color: transparent !important;
  border: none !important;
}

table {
  border-color: ${colors.border} !important;
}
tr:nth-of-type(even),
tr:nth-child(even) {
  background-color: ${colors.zebra} !important;
}
th, td {
  border-color: ${colors.border} !important;
}

div.index h3 {
  background-color: ${colors.card} !important;
  color: ${colors.cardFg} !important;
}
`;
  }

  return "";
}

/**
 * Base CSS rules for equations, MathML, and authored containers across all themes.
 * Prevents equations, math formulas, and callouts from overflowing or bleeding into adjacent columns.
 */
export function getEquationAndContainerBaseCss(): string {
  return `
/* ── Authored containers & callout boxes containment ── */
aside,
div.sidebar,
.sidebar,
aside[data-type="sidebar"],
[data-type="sidebar"],
[epub\\:type~="sidebar"],
div.callout,
.callout,
[data-type="callout"],
div.note,
.note,
[data-type="note"],
[epub\\:type~="note"],
div.tip,
.tip,
[data-type="tip"],
[epub\\:type~="tip"],
div.warning,
.warning,
[data-type="warning"],
[epub\\:type~="warning"],
div.caution,
.caution,
[data-type="caution"],
[epub\\:type~="caution"],
div.important,
.important,
[data-type="important"],
[epub\\:type~="important"],
.infobox,
.boxedtext,
.boxed-text,
.card {
  box-sizing: border-box !important;
  max-width: 100% !important;
}

/* ── Equations and MathML overflow containment ── */
div[data-type="equation"],
div.equation,
div.equation-contents,
div.informalequation,
[data-type="equation"],
[data-type="informalequation"],
[epub\\:type~="equation"],
figure[data-type="equation"],
figure.equation,
.equation,
.equation-contents,
.informalequation,
.math-display,
.display-math,
.katex-display,
.MathJax_Display,
mjx-container[display="true"],
.readany-math-wrapper {
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  -webkit-overflow-scrolling: touch;
}

math {
  max-width: 100%;
  box-sizing: border-box;
}

/* Neutralize authored viewport units (vw/vh) and excessive sizing on equation math */
div[data-type="equation"] math,
div.equation math,
div.equation-contents math,
div.informalequation math,
[data-type="equation"] math,
[data-type="informalequation"] math,
[epub\\:type~="equation"] math,
figure[data-type="equation"] math,
figure.equation math,
.equation math,
.equation-contents math,
.informalequation math,
.math-display math,
.display-math math,
.katex-display math,
.MathJax_Display math,
.readany-math-wrapper math,
math[display="block"],
math.display {
  font-size: 1em !important;
  width: max-content;
  max-width: 100%;
}

math[display="block"],
math.display {
  display: block !important;
  box-sizing: border-box !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  -webkit-overflow-scrolling: touch;
}

/* Subtle scrollbars for overflowing equations */
div[data-type="equation"]::-webkit-scrollbar,
div.equation::-webkit-scrollbar,
div.informalequation::-webkit-scrollbar,
.readany-math-wrapper::-webkit-scrollbar {
  height: 4px;
}
div[data-type="equation"]::-webkit-scrollbar-thumb,
div.equation::-webkit-scrollbar-thumb,
div.informalequation::-webkit-scrollbar-thumb,
.readany-math-wrapper::-webkit-scrollbar-thumb {
  background: var(--theme-border-color, rgba(128, 128, 128, 0.4));
  border-radius: 2px;
}
`;
}
