import DOMPurify from "isomorphic-dompurify";

// Strip ALL HTML — we only render text in the UI.
export function sanitizeText(input: unknown): string {
  if (input == null) return "";
  const s = typeof input === "string" ? input : String(input);
  return DOMPurify.sanitize(s, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
