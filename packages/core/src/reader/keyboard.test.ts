import { describe, expect, it } from "vitest";
import {
  DEFAULT_BINDINGS,
  findAction,
  formatKeyBinding,
  getKeymapByCategory,
  isInputElement,
  matchBinding,
  shouldIgnoreKeyboardShortcut,
} from "./keyboard";

describe("keyboard", () => {
  it("has default bindings organized into categories", () => {
    expect(DEFAULT_BINDINGS.length).toBeGreaterThan(10);
    const categories = getKeymapByCategory(DEFAULT_BINDINGS);
    expect(categories.navigation.length).toBeGreaterThan(0);
    expect(categories.reading.length).toBeGreaterThan(0);
    expect(categories.zoom.length).toBeGreaterThan(0);
    expect(categories.general.length).toBeGreaterThan(0);
  });

  it("matches keyboard events accurately", () => {
    const spaceBinding = DEFAULT_BINDINGS.find((b) => b.action === "page-next" && b.key === " ")!;
    expect(
      matchBinding(
        {
          key: " ",
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false,
        } as KeyboardEvent,
        spaceBinding,
      ),
    ).toBe(true);

    const tocBinding = DEFAULT_BINDINGS.find((b) => b.action === "toggle-toc")!;
    expect(
      matchBinding(
        {
          key: "t",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false,
        } as KeyboardEvent,
        tocBinding,
      ),
    ).toBe(true);
    expect(
      matchBinding(
        {
          key: "t",
          ctrlKey: false,
          metaKey: true,
          shiftKey: false,
          altKey: false,
        } as KeyboardEvent,
        tocBinding,
      ),
    ).toBe(true);
    expect(
      matchBinding(
        {
          key: "t",
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false,
        } as KeyboardEvent,
        tocBinding,
      ),
    ).toBe(false);
  });

  it("finds actions for events", () => {
    const action = findAction({
      key: "ArrowRight",
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      defaultPrevented: false,
      target: null,
    } as unknown as KeyboardEvent);
    expect(action).toBe("page-next");
  });

  it("formats keybindings for Mac and non-Mac platforms", () => {
    const tocBinding = DEFAULT_BINDINGS.find((b) => b.action === "toggle-toc")!;
    expect(formatKeyBinding(tocBinding, true)).toEqual(["⌘", "T"]);
    expect(formatKeyBinding(tocBinding, false)).toEqual(["Ctrl", "T"]);
  });

  it("ignores keyboard shortcuts when typing in inputs", () => {
    expect(isInputElement(null)).toBe(false);
    expect(
      shouldIgnoreKeyboardShortcut({
        defaultPrevented: true,
        key: "ArrowRight",
        target: null,
      }),
    ).toBe(true);
  });
});
