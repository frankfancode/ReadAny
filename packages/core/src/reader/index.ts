// Font themes
export { FONT_THEMES, DEFAULT_FONT_THEME, getFontTheme } from "./font-themes";

// Keyboard shortcuts
export {
  DEFAULT_BINDINGS,
  isInputElement,
  matchBinding,
  findAction,
  formatKeyBinding,
  getKeymapByCategory,
  shouldIgnoreKeyboardShortcut,
} from "./keyboard";
export type { KeyBinding, KeymapCategory } from "./keyboard";

// Table of contents
export { getFirstTocHref } from "./toc";

// Pagination
export {
  getPageDirection,
  getScrollPageOffset,
  navigatePage,
  calculateProgress,
} from "./pagination";
export type { PageDirection } from "./pagination";

// Progress tracking
export { createProgressTracker, estimateTimeToFinish } from "./progress";
export type { ProgressData } from "./progress";

// Session detection
export { createSessionDetector } from "./session-detector";
export type { SessionEvent, SessionDetector } from "./session-detector";

// Annotation mutations
export { createSelectionNoteMutation } from "./selection-note";
export type { SelectionNoteMutation, SelectionNoteMutationInput } from "./selection-note";
export {
  compareAnnotationPosition,
  compareCfiPosition,
  sortAnnotationsByPosition,
} from "./annotation-order";

// Justified body text (shared by desktop viewer and mobile reader WebView)
export {
  applyJustifiedText,
  BR_CONTAINER_SELECTOR,
  buildJustifyCss,
  collectBrContainers,
  detectJustifyCapabilities,
  installReadAnyJustifiedText,
  JUSTIFY_CSS,
  ORIGINAL_ATTR,
  pinAlignedBrContainers,
  PIN_ATTR,
  unpinAlignedBrContainers,
} from "./justified-text";
export type { JustifyCapabilities } from "./justified-text";

// Reader theme styles & container overrides
export {
  buildThemeOverrideCss,
  getEquationAndContainerBaseCss,
  getReaderThemeColors,
  READER_THEME_COLORS,
} from "./theme-styles";
export type { ReaderTheme, ReaderThemeColors } from "./theme-styles";

// Math & document sanitization (repairing mojibake in MathML / EPUBs)
export {
  decodeMojibakeInText,
  sanitizeMathMojibake,
  tryDecodeMojibake,
} from "./math-sanitizer";
