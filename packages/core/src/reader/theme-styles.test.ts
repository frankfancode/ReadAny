import { describe, expect, it } from "vitest";
import { READER_THEME_COLORS, buildThemeOverrideCss, getReaderThemeColors } from "./theme-styles";

describe("theme-styles", () => {
  it("provides colors for light, dark, and sepia themes", () => {
    expect(READER_THEME_COLORS.light.bg).toBe("#ffffff");
    expect(READER_THEME_COLORS.dark.bg).toBe("#121212");
    expect(READER_THEME_COLORS.sepia.bg).toBe("#f0e6d2");

    expect(getReaderThemeColors("dark").card).toBe("#1e1e1e");
    expect(getReaderThemeColors("dark").border).toBe("#333333");
    expect(getReaderThemeColors("sepia").card).toBe("#f5ebd7");
  });

  it("returns empty string for light theme", () => {
    const css = buildThemeOverrideCss("light");
    expect(css).toBe("");
  });

  it("builds dark mode container and sidebar overrides", () => {
    const css = buildThemeOverrideCss("dark");
    expect(css).toContain("div.sidebar");
    expect(css).toContain('aside[data-type="sidebar"]');
    expect(css).toContain("background-color: #1e1e1e !important");
    expect(css).toContain("border-color: #333333 !important");
    expect(css).toContain("aside:has(.sidebar)");
    expect(css).toContain("tr:nth-of-type(even)");
    expect(css).toContain("pre code.hll");
  });

  it("builds sepia mode container and sidebar overrides", () => {
    const css = buildThemeOverrideCss("sepia");
    expect(css).toContain("div.sidebar");
    expect(css).toContain("background-color: #f5ebd7 !important");
    expect(css).toContain("border-color: #d4c4a8 !important");
    expect(css).toContain("tr:nth-of-type(even)");
  });

  it("supports custom color overrides", () => {
    const css = buildThemeOverrideCss("dark", {
      card: "#000000",
      border: "#111111",
    });
    expect(css).toContain("background-color: #000000 !important");
    expect(css).toContain("border-color: #111111 !important");
  });
});
