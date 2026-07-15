/**
 * LinkedIn prohibits scraping in its ToS and actively blocks bots. This stub
 * exists purely so the source registry has a fixed slot for LinkedIn — swap
 * the `fetch` implementation for a real call once official API/partner
 * access (LinkedIn Talent Solutions / Jobs API) is obtained. Never scrape
 * linkedin.com directly.
 */
import { defineJobSource, NotImplementedError, type RawJob } from "../types";

export const linkedin = defineJobSource({
  name: "linkedin",
  displayName: "LinkedIn",
  baseUrl: "https://www.linkedin.com/jobs",
  isEnabled: () => false,
  disabledReason: "disabled: NOT_IMPLEMENTED (ToS blocks scraping — needs official API/partner access)",
  fetch: async (): Promise<RawJob[]> => {
    throw new NotImplementedError("LinkedIn");
  },
});
