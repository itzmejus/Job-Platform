import type { JobSource } from "./types";
import { arbeitnow } from "./arbeitnow";
import { bundesagentur } from "./bundesagentur";
import { adzuna } from "./adzuna";
import { jooble } from "./jooble";
import { linkedin } from "./stubs/linkedin";
import { indeed } from "./stubs/indeed";
import { stepstone } from "./stubs/stepstone";
import { xing } from "./stubs/xing";

/**
 * The one place that lists job sources. Adding a source is: write the
 * adapter file, add it to this array. Neither the sync orchestrator nor any
 * dashboard code imports an individual adapter directly — everything goes
 * through this registry and the canonical Job/JobSource types.
 */
export const jobSourceRegistry: JobSource[] = [
  arbeitnow,
  bundesagentur,
  adzuna,
  jooble,
  linkedin,
  indeed,
  stepstone,
  xing,
];
