/**
 * RideLoop spacing scale — 8-point grid.
 * Values map to Tailwind spacing utilities via @theme in theme.css.
 */

export const spacing = {
  /** 4px */
  1: "0.25rem",
  /** 8px */
  2: "0.5rem",
  /** 12px */
  3: "0.75rem",
  /** 16px */
  4: "1rem",
  /** 20px */
  5: "1.25rem",
  /** 24px */
  6: "1.5rem",
  /** 32px */
  8: "2rem",
  /** 40px */
  10: "2.5rem",
  /** 48px */
  12: "3rem",
  /** 64px */
  16: "4rem",
} as const;

/** Pixel reference for documentation and programmatic layout */
export const spacingPx = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type SpacingToken = keyof typeof spacing;
