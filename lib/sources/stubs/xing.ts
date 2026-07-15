/**
 * Xing prohibits scraping in its ToS and actively blocks bots. This stub
 * exists purely so the source registry has a fixed slot for Xing — swap the
 * `fetch` implementation for a real call once official API or a licensed
 * feed is obtained. Never scrape xing.com directly.
 */
import { defineJobSource, NotImplementedError, type RawJob } from "../types";

export const xing = defineJobSource({
  name: "xing",
  displayName: "Xing",
  baseUrl: "https://www.xing.com/jobs",
  isEnabled: () => false,
  disabledReason: "disabled: NOT_IMPLEMENTED (ToS blocks scraping — needs official API or licensed feed)",
  fetch: async (): Promise<RawJob[]> => {
    throw new NotImplementedError("Xing");
  },
});
