import "server-only";
import DOMPurify from "isomorphic-dompurify";

/**
 * Job descriptions from some sources (Arbeitnow, Bundesagentur) contain real
 * HTML. It's third-party content we don't control, so it's sanitized before
 * ever being rendered with dangerouslySetInnerHTML.
 */
export function sanitizeJobDescription(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}
