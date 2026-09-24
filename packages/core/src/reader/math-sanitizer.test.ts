import { DOMParser } from "@xmldom/xmldom";
import { describe, expect, it } from "vitest";
import { decodeMojibakeInText, sanitizeMathMojibake, tryDecodeMojibake } from "./math-sanitizer";

describe("math-sanitizer", () => {
  describe("tryDecodeMojibake", () => {
    it("decodes ellipsis mojibake correctly", () => {
      // UTF-8 bytes 0xE2 0x80 0xA6 -> â \u0080 ¦ or â € ¦
      expect(tryDecodeMojibake("â\u0080¦")).toBe("…");
      expect(tryDecodeMojibake("â€¦")).toBe("…");
    });

    it("decodes prime and quote mojibake correctly", () => {
      // UTF-8 bytes 0xE2 0x80 0x99 -> â \u0080 \u0099 or â € ™
      expect(tryDecodeMojibake("â\u0080\u0099")).toBe("’");
      expect(tryDecodeMojibake("â€™")).toBe("’");
    });

    it("decodes 2-byte UTF-8 mojibake correctly", () => {
      expect(tryDecodeMojibake("Ã©")).toBe("é");
      expect(tryDecodeMojibake("Ã—")).toBe("×");
    });

    it("does not corrupt valid ASCII or standard characters", () => {
      expect(tryDecodeMojibake("x1")).toBeNull();
      expect(tryDecodeMojibake("log")).toBeNull();
      expect(tryDecodeMojibake("αβ")).toBeNull();
      expect(tryDecodeMojibake("∑∏")).toBeNull();
      expect(tryDecodeMojibake("café")).toBeNull();
      expect(tryDecodeMojibake("你好")).toBeNull();
    });
  });

  describe("decodeMojibakeInText", () => {
    it("fixes mojibake within mixed text strings", () => {
      expect(decodeMojibakeInText("value is â€¦ here")).toBe("value is … here");
      expect(decodeMojibakeInText("Wâ€™ = W")).toBe("W’ = W");
      expect(decodeMojibakeInText("Normal text with café and 你好")).toBe(
        "Normal text with café and 你好",
      );
    });
  });

  describe("sanitizeMathMojibake DOM manipulation", () => {
    it("replaces consecutive mojibake mi elements with a single mo ellipsis element", () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<math xmlns="http://www.w3.org/1998/Math/MathML">
          <mrow>
            <mi>P</mi>
            <mo>(</mo>
            <msub><mi>x</mi><mn>1</mn></msub>
            <mo>,</mo>
            <mi>â</mi>
            <mi>&#128;</mi>
            <mi>¦</mi>
            <mo>,</mo>
            <msub><mi>x</mi><mi>n</mi></msub>
            <mo>)</mo>
          </mrow>
        </math>`,
        "text/xml",
      );

      sanitizeMathMojibake(doc as unknown as Document);

      const mrow = doc.getElementsByTagName("mrow")[0];
      const childElements = Array.from(mrow.childNodes).filter((n) => n.nodeType === 1);
      const textNodes = childElements.map((el) => el.textContent);
      expect(textNodes).toEqual(["P", "(", "x1", ",", "…", ",", "xn", ")"]);

      const ellipsisEl = childElements[4];
      expect(ellipsisEl.nodeName.toLowerCase()).toBe("mo");
      expect(ellipsisEl.textContent).toBe("…");
    });

    it("normalizes prime in formulas like W' to prime symbol", () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<math xmlns="http://www.w3.org/1998/Math/MathML">
          <mrow>
            <mi>W</mi>
            <mi>â</mi>
            <mi>&#128;</mi>
            <mi>&#153;</mi>
            <mo>=</mo>
            <mi>W</mi>
          </mrow>
        </math>`,
        "text/xml",
      );

      sanitizeMathMojibake(doc as unknown as Document);

      const mrow = doc.getElementsByTagName("mrow")[0];
      const childElements = Array.from(mrow.childNodes).filter((n) => n.nodeType === 1);
      const textNodes = childElements.map((el) => el.textContent);
      expect(textNodes).toEqual(["W", "′", "=", "W"]);

      const primeEl = childElements[1];
      expect(primeEl.nodeName.toLowerCase()).toBe("mo");
      expect(primeEl.textContent).toBe("′");
    });

    it("sanitizes single leaf elements with mojibake text", () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<math xmlns="http://www.w3.org/1998/Math/MathML">
          <mrow>
            <mtext>some â€¦ text</mtext>
          </mrow>
        </math>`,
        "text/xml",
      );

      sanitizeMathMojibake(doc as unknown as Document);

      const mtext = doc.getElementsByTagName("mtext")[0];
      expect(mtext.textContent).toBe("some … text");
    });
  });
});
