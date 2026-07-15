/**
 * StepStone prohibits scraping in its ToS and actively blocks bots. This
 * stub exists purely so the source registry has a fixed slot for StepStone
 * — swap the `fetch` implementation for a real call once official API or a
 * licensed feed is obtained. Never scrape stepstone.de directly.
 */
import { defineJobSource, NotImplementedError, type RawJob } from "../types";

export const stepstone = defineJobSource({
  name: "stepstone",
  displayName: "StepStone",
  baseUrl: "https://www.stepstone.de",
  isEnabled: () => false,
  disabledReason: "disabled: NOT_IMPLEMENTED (ToS blocks scraping — needs official API or licensed feed)",
  fetch: async (): Promise<RawJob[]> => {
    throw new NotImplementedError("StepStone");
  },
});
