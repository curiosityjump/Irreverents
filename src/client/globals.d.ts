import type { Content } from '../content/types.ts';

declare global {
  /** The validated content/, baked in by scripts/build.ts. */
  const __CONTENT__: Content;
}
