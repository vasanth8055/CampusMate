/**
 * RideLoop typography scale — Plus Jakarta Sans with Inter fallback.
 * Mirrors CSS @theme text utilities in theme.css.
 */

export const fontFamily = {
  sans: '"Geist", "Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif',
  display: '"Geist", "Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Size in rem, line-height unitless, letter-spacing in em where set */
export const textScale = {
  display: {
    fontSize: "3.5rem",
    lineHeight: 1.1,
    fontWeight: fontWeight.bold,
    letterSpacing: "-0.02em",
  },
  h1: {
    fontSize: "2.25rem",
    lineHeight: 1.2,
    fontWeight: fontWeight.bold,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.875rem",
    lineHeight: 1.25,
    fontWeight: fontWeight.semibold,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: "1.5rem",
    lineHeight: 1.3,
    fontWeight: fontWeight.semibold,
  },
  bodyLg: {
    fontSize: "1.125rem",
    lineHeight: 1.6,
    fontWeight: fontWeight.regular,
  },
  body: {
    fontSize: "1rem",
    lineHeight: 1.5,
    fontWeight: fontWeight.regular,
  },
  small: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.4,
    fontWeight: fontWeight.regular,
  },
  label: {
    fontSize: "0.875rem",
    lineHeight: 1.4,
    fontWeight: fontWeight.medium,
  },
} as const;

/** Tailwind utility class names for each scale step */
export const textUtility = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  bodyLg: "text-body-lg",
  body: "text-body",
  small: "text-small",
  caption: "text-caption",
  label: "text-label",
} as const;

export type TextScale = keyof typeof textScale;
export type TextUtility = (typeof textUtility)[keyof typeof textUtility];
