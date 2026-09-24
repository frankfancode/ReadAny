/**
 * Utilities for repairing mojibake and encoding corruption in MathML and reader documents.
 * Common in EPUBs when UTF-8 math/punctuation was misinterpreted as Windows-1252/ISO-8859-1
 * by legacy publisher pipelines (e.g. `â\u0080¦` instead of `…`, `â\u0080\u0099` instead of `’`/`′`).
 */

const CP1252_MAP: Record<string, number> = {
  "\u20AC": 0x80, // €
  "\u201A": 0x82, // ‚
  "\u0192": 0x83, // ƒ
  "\u201E": 0x84, // „
  "\u2026": 0x85, // …
  "\u2020": 0x86, // †
  "\u2021": 0x87, // ‡
  "\u02C6": 0x88, // ˆ
  "\u2030": 0x89, // ‰
  "\u0160": 0x8a, // Š
  "\u2039": 0x8b, // ‹
  "\u0152": 0x8c, // Œ
  "\u017D": 0x8e, // Ž
  "\u2018": 0x91, // ‘
  "\u2019": 0x92, // ’
  "\u201C": 0x93, // “
  "\u201D": 0x94, // ”
  "\u2022": 0x95, // •
  "\u2013": 0x96, // –
  "\u2014": 0x97, // —
  "\u02DC": 0x98, // ˜
  "\u2122": 0x99, // ™
  "\u0161": 0x9a, // š
  "\u203A": 0x9b, // ›
  "\u0153": 0x9c, // œ
  "\u017E": 0x9e, // ž
  "\u0178": 0x9f, // Ÿ
};

function charToByte(char: string): number | null {
  const code = char.charCodeAt(0);
  if (code < 256) return code;
  if (CP1252_MAP[char] !== undefined) return CP1252_MAP[char];
  return null;
}

/**
 * Validates whether a byte array represents a valid multi-byte UTF-8 character sequence.
 */
function isValidMojibakeSequence(bytes: number[]): boolean {
  if (bytes.length < 2 || bytes.length > 4) return false;
  const b0 = bytes[0];
  if (bytes.length === 2 && !(b0 >= 0xc2 && b0 <= 0xdf)) return false;
  if (bytes.length === 3 && !(b0 >= 0xe0 && b0 <= 0xef)) return false;
  if (bytes.length === 4 && !(b0 >= 0xf0 && b0 <= 0xf4)) return false;
  for (let i = 1; i < bytes.length; i++) {
    if (bytes[i] < 0x80 || bytes[i] > 0xbf) return false;
  }
  return true;
}

/**
 * Attempts to decode a string that was produced by decoding UTF-8 bytes as Windows-1252 or Latin-1.
 * Returns the recovered UTF-8 string if valid, or null otherwise.
 */
export function tryDecodeMojibake(str: string): string | null {
  if (!str || str.length < 2 || str.length > 4) return null;
  const bytes: number[] = [];

  for (const ch of str) {
    const b = charToByte(ch);
    if (b === null) return null;
    bytes.push(b);
  }

  if (!isValidMojibakeSequence(bytes)) return null;

  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
    if (decoded && decoded !== str) return decoded;
    return null;
  } catch {
    return null;
  }
}

/**
 * Replaces mojibake character sequences in arbitrary text strings.
 */
export function decodeMojibakeInText(text: string): string {
  if (!text || text.length < 2) return text;
  return text.replace(
    /[\xC2-\xDF][\x80-\xBF\u0100-\u2122]|[\xE0-\xEF][\x80-\xBF\u0100-\u2122]{2}|[\xF0-\xF4][\x80-\xBF\u0100-\u2122]{3}/g,
    (match) => {
      return tryDecodeMojibake(match) ?? match;
    },
  );
}

const MATH_LEAF_TAGS = new Set(["mi", "mo", "mn", "mtext"]);

function getElementChildren(node: Node): Element[] {
  const elements: Element[] = [];
  const children = node.childNodes;
  if (!children) return elements;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 1) {
      elements.push(child as Element);
    }
  }
  return elements;
}

function getTagName(el: Element): string {
  return (el.localName || el.nodeName).toLowerCase();
}

function sanitizeMathSubtree(doc: Document, parent: Element): void {
  const childElements = getElementChildren(parent);

  // First recurse into children
  for (const child of childElements) {
    if (child.childNodes && child.childNodes.length > 0) {
      sanitizeMathSubtree(doc, child);
    }
  }

  // Then process siblings within this parent
  const children = getElementChildren(parent);
  let i = 0;

  while (i < children.length) {
    let matched = false;

    // Check sliding window of 4, 3, 2 for consecutive mojibake elements
    const maxLen = Math.min(4, children.length - i);
    for (let len = maxLen; len >= 2; len--) {
      const slice = children.slice(i, i + len);
      const allLeaves = slice.every(
        (el) => MATH_LEAF_TAGS.has(getTagName(el)) && getElementChildren(el).length === 0,
      );

      if (allLeaves) {
        const combinedText = slice.map((el) => el.textContent || "").join("");
        const decoded = tryDecodeMojibake(combinedText);

        if (decoded) {
          const isPunctuationOrOp =
            decoded === "…" ||
            decoded === "’" ||
            decoded === "′" ||
            decoded === "–" ||
            decoded === "—";
          const tag = isPunctuationOrOp ? "mo" : getTagName(slice[0]);
          const replacement = doc.createElementNS
            ? doc.createElementNS("http://www.w3.org/1998/Math/MathML", tag)
            : doc.createElement(tag);

          // Normalize right single quote in math to prime (U+2032)
          replacement.textContent = decoded === "’" ? "′" : decoded;

          parent.insertBefore(replacement, slice[0]);
          for (const el of slice) {
            parent.removeChild(el);
          }
          children.splice(i, len, replacement);
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // Check single element text content
      const el = children[i];
      if (getElementChildren(el).length === 0 && el.textContent) {
        const decoded = tryDecodeMojibake(el.textContent);
        if (decoded) {
          el.textContent = decoded === "’" ? "′" : decoded;
        } else {
          const inTextDecoded = decodeMojibakeInText(el.textContent);
          if (inTextDecoded !== el.textContent) {
            el.textContent = inTextDecoded;
          }
        }
      }
      i++;
    }
  }
}

/**
 * Normalizes and sanitizes mojibake inside MathML `<math>` elements.
 * Fixes broken operators like ellipsis (`…`), prime (`′`), quotes, and dashes
 * split across multiple consecutive `<mi>` tags or inside text nodes.
 */
export function sanitizeMathMojibake(doc: Document): void {
  const mathList = doc.getElementsByTagName("math");
  if (!mathList || mathList.length === 0) return;

  const mathElements = Array.from(mathList);
  for (const math of mathElements) {
    // Sanitize alttext if present
    const alttext = math.getAttribute?.("alttext");
    if (alttext) {
      const sanitizedAlt = decodeMojibakeInText(alttext);
      if (sanitizedAlt !== alttext) {
        math.setAttribute("alttext", sanitizedAlt);
      }
    }

    sanitizeMathSubtree(doc, math);
  }
}
