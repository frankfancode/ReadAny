/**
 * Keyboard shortcut management — full keybinding with tab isolation + input filtering
 */

export type KeymapCategory = "navigation" | "reading" | "zoom" | "general";

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
  category?: KeymapCategory;
  keysDisplay?: string[];
}

/** Default keyboard bindings */
export const DEFAULT_BINDINGS: KeyBinding[] = [
  // Navigation
  {
    key: "ArrowRight",
    action: "page-next",
    description: "Next page",
    category: "navigation",
    keysDisplay: ["→"],
  },
  {
    key: "ArrowLeft",
    action: "page-prev",
    description: "Previous page",
    category: "navigation",
    keysDisplay: ["←"],
  },
  {
    key: " ",
    action: "page-next",
    description: "Next page (Space)",
    category: "navigation",
    keysDisplay: ["Space"],
  },
  {
    key: " ",
    shift: true,
    action: "page-prev",
    description: "Previous page (Shift+Space)",
    category: "navigation",
    keysDisplay: ["Shift", "Space"],
  },
  {
    key: "PageDown",
    action: "page-next",
    description: "Next page (PageDown)",
    category: "navigation",
    keysDisplay: ["PageDown"],
  },
  {
    key: "PageUp",
    action: "page-prev",
    description: "Previous page (PageUp)",
    category: "navigation",
    keysDisplay: ["PageUp"],
  },
  {
    key: "ArrowDown",
    action: "scroll-down",
    description: "Scroll down",
    category: "navigation",
    keysDisplay: ["↓"],
  },
  {
    key: "ArrowUp",
    action: "scroll-up",
    description: "Scroll up",
    category: "navigation",
    keysDisplay: ["↑"],
  },
  {
    key: "]",
    action: "chapter-next",
    description: "Next chapter",
    category: "navigation",
    keysDisplay: ["]"],
  },
  {
    key: "[",
    action: "chapter-prev",
    description: "Previous chapter",
    category: "navigation",
    keysDisplay: ["["],
  },

  // Reading & View
  {
    key: "t",
    meta: true,
    action: "toggle-toc",
    description: "Toggle Table of Contents",
    category: "reading",
    keysDisplay: ["⌘", "T"],
  },
  {
    key: "b",
    meta: true,
    action: "toggle-sidebar",
    description: "Toggle sidebar",
    category: "reading",
    keysDisplay: ["⌘", "B"],
  },
  {
    key: "f",
    meta: true,
    action: "search",
    description: "Search in book",
    category: "reading",
    keysDisplay: ["⌘", "F"],
  },
  {
    key: "F11",
    action: "fullscreen",
    description: "Toggle fullscreen",
    category: "reading",
    keysDisplay: ["F11"],
  },

  // Zoom & Font
  {
    key: "=",
    meta: true,
    action: "zoom-in",
    description: "Increase font size",
    category: "zoom",
    keysDisplay: ["⌘", "+"],
  },
  {
    key: "-",
    meta: true,
    action: "zoom-out",
    description: "Decrease font size",
    category: "zoom",
    keysDisplay: ["⌘", "-"],
  },
  {
    key: "0",
    meta: true,
    action: "zoom-reset",
    description: "Reset font size",
    category: "zoom",
    keysDisplay: ["⌘", "0"],
  },

  // General & Tools
  {
    key: "p",
    meta: true,
    shift: true,
    action: "command-palette",
    description: "Open command palette",
    category: "general",
    keysDisplay: ["⌘", "Shift", "P"],
  },
  {
    key: ",",
    meta: true,
    action: "settings",
    description: "Open settings",
    category: "general",
    keysDisplay: ["⌘", ","],
  },
  {
    key: "?",
    action: "keymap-dialog",
    description: "Open shortcuts cheat sheet",
    category: "general",
    keysDisplay: ["?"],
  },
];

/** Check if the keyboard event target is an editable or interactive element */
export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;

  return Boolean(
    target.closest(
      "input, textarea, select, button, [contenteditable='true'], [contenteditable=''], [role='textbox'], [role='button']",
    ),
  );
}

/** IME composition should not trigger reader shortcuts. */
export function isComposingKeyboardEvent(event: {
  isComposing?: boolean;
  key?: string;
  keyCode?: number;
}): boolean {
  return event.isComposing === true || event.key === "Process" || event.keyCode === 229;
}

/** Shared guard for reader/global shortcuts. */
export function shouldIgnoreKeyboardShortcut(
  event: Pick<KeyboardEvent, "defaultPrevented" | "isComposing" | "key" | "keyCode" | "target">,
): boolean {
  return event.defaultPrevented || isComposingKeyboardEvent(event) || isInputElement(event.target);
}

/** Match a keyboard event against a binding */
export function matchBinding(event: KeyboardEvent, binding: KeyBinding): boolean {
  const isCmdOrCtrl = event.metaKey || event.ctrlKey;
  const requiresCmdOrCtrl = !!binding.meta || !!binding.ctrl;

  if (requiresCmdOrCtrl) {
    if (!isCmdOrCtrl) return false;
  } else {
    if (event.metaKey || event.ctrlKey) return false;
  }

  return (
    event.key.toLowerCase() === binding.key.toLowerCase() &&
    !!event.shiftKey === !!binding.shift &&
    !!event.altKey === !!binding.alt
  );
}

/** Find matching action for a keyboard event */
export function findAction(
  event: KeyboardEvent,
  bindings: KeyBinding[] = DEFAULT_BINDINGS,
): string | null {
  if (shouldIgnoreKeyboardShortcut(event)) return null;
  const match = bindings.find((b) => matchBinding(event, b));
  return match?.action ?? null;
}

/** Format key binding for display based on platform */
export function formatKeyBinding(
  binding: KeyBinding,
  isMac: boolean = typeof navigator !== "undefined"
    ? /mac/i.test(navigator.platform || navigator.userAgent)
    : true,
): string[] {
  if (binding.keysDisplay && binding.keysDisplay.length > 0) {
    if (isMac) return binding.keysDisplay;
    return binding.keysDisplay.map((k) => {
      if (k === "⌘") return "Ctrl";
      if (k === "⌥") return "Alt";
      if (k === "⇧") return "Shift";
      return k;
    });
  }

  const parts: string[] = [];
  if (binding.ctrl || binding.meta) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (binding.alt) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (binding.shift) {
    parts.push(isMac ? "⇧" : "Shift");
  }
  parts.push(binding.key === " " ? "Space" : binding.key);
  return parts;
}

/** Group keybindings by category */
export function getKeymapByCategory(
  bindings: KeyBinding[] = DEFAULT_BINDINGS,
): Record<KeymapCategory, KeyBinding[]> {
  const categories: Record<KeymapCategory, KeyBinding[]> = {
    navigation: [],
    reading: [],
    zoom: [],
    general: [],
  };

  for (const binding of bindings) {
    const cat = binding.category || "general";
    categories[cat].push(binding);
  }

  return categories;
}
