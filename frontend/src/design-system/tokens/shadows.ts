/**
 * RideLoop elevation shadows — use sparingly.
 */

export const shadow = {
  soft: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
  medium:
    "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
  large:
    "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)",
  premium:
    "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
} as const;

/** Tailwind shadow utility class names */
export const shadowUtility = {
  soft: "shadow-soft",
  medium: "shadow-medium",
  large: "shadow-large",
  premium: "shadow-premium",
} as const;

export type ShadowToken = keyof typeof shadow;
