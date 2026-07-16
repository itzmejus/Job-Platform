import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Job descriptions from some sources (Arbeitnow, Bundesagentur) contain real
 * HTML. It's third-party content we don't control, so it's sanitized before
 * ever being rendered with dangerouslySetInnerHTML.
 *
 * Uses `sanitize-html` (pure JS, regex/parser based) rather than
 * isomorphic-dompurify: that package pulls in jsdom, which Vercel's
 * serverless bundling repeatedly failed to trace correctly at runtime
 * (jsdom's dynamic requires don't survive Turbopack's file tracing),
 * causing 500s on this exact page.
 */
export function sanitizeJobDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
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
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
