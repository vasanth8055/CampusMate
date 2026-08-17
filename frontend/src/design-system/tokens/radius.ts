/**
 * RideLoop border-radius tokens.
 * Component-specific radii per brand guidelines.
 */

export const radius = {
  /** Buttons — 12px */
  button: "0.75rem",
  /** Inputs — 12px */
  input: "0.75rem",
  /** Cards — 20px */
  card: "1.25rem",
  /** Dialogs — 24px */
  dialog: "1.5rem",
  /** Bottom sheets — 28px */
  sheet: "1.75rem",
  full: "9999px",
} as const;

/** Tailwind radius utility aliases */
export const radiusUtility = {
  button: "rounded-button",
  input: "rounded-input",
  card: "rounded-card",
  dialog: "rounded-dialog",
  sheet: "rounded-sheet",
  full: "rounded-full",
} as const;

export type RadiusToken = keyof typeof radius;
