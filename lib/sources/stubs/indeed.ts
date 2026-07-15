/**
 * Indeed prohibits scraping in its ToS and actively blocks bots. This stub
 * exists purely so the source registry has a fixed slot for Indeed — swap
 * the `fetch` implementation for a real call once official API/publisher
 * access (Indeed Apply / XML feed partnership) is obtained. Never scrape
 * indeed.com directly.
 */
import { defineJobSource, NotImplementedError, type RawJob } from "../types";

export const indeed = defineJobSource({
  name: "indeed",
  displayName: "Indeed",
  baseUrl: "https://www.indeed.com",
  isEnabled: () => false,
  disabledReason: "disabled: NOT_IMPLEMENTED (ToS blocks scraping — needs official API/publisher access)",
  fetch: async (): Promise<RawJob[]> => {
    throw new NotImplementedError("Indeed");
  },
});
