/**
 * RideLoop motion tokens — subtle, purposeful animation.
 */

export const duration = {
  fast: "150ms",
  normal: "250ms",
  slow: "350ms",
} as const;

export const easing = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/** Preset transition strings for inline style or CSS-in-JS */
export const transition = {
  colors: `color ${duration.fast} ${easing.default}, background-color ${duration.fast} ${easing.default}, border-color ${duration.fast} ${easing.default}`,
  opacity: `opacity ${duration.normal} ${easing.default}`,
  transform: `transform ${duration.normal} ${easing.out}`,
  all: `all ${duration.normal} ${easing.default}`,
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
