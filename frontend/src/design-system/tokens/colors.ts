/**
 * RideLoop brand palette — frozen values.
 * Semantic tokens that change per theme live in CSS variables (theme.css).
 */

export const brand = {
  primary: {
    DEFAULT: "#4338CA",
    hover: "#3730A3",
    pressed: "#312E81",
    foreground: "#FFFFFF",
    subtle: "#EEF2FF",
  },
  secondary: {
    DEFAULT: "#4F46E5",
    hover: "#4338CA",
    foreground: "#FFFFFF",
    subtle: "#EEF2FF",
  },
  accent: {
    DEFAULT: "#F59E0B",
    foreground: "#111827",
  },
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#4F46E5",
} as const;

export const neutral = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  disabled: "#9CA3AF",
} as const;

export const dark = {
  background: "#0F172A",
  surface: "#1E293B",
  text: "#F8FAFC",
} as const;

/** CSS custom-property names used by theme.css */
export const cssVar = {
  background: "--rl-background",
  surface: "--rl-surface",
  surfaceElevated: "--rl-surface-elevated",
  border: "--rl-border",
  borderSubtle: "--rl-border-subtle",
  foreground: "--rl-foreground",
  foregroundSecondary: "--rl-foreground-secondary",
  foregroundMuted: "--rl-foreground-muted",
  foregroundInverse: "--rl-foreground-inverse",
  primary: "--rl-primary",
  primaryHover: "--rl-primary-hover",
  primaryPressed: "--rl-primary-pressed",
  primaryForeground: "--rl-primary-foreground",
  primarySubtle: "--rl-primary-subtle",
  secondary: "--rl-secondary",
  secondaryHover: "--rl-secondary-hover",
  secondaryForeground: "--rl-secondary-foreground",
  secondarySubtle: "--rl-secondary-subtle",
  accent: "--rl-accent",
  accentForeground: "--rl-accent-foreground",
  success: "--rl-success",
  successSubtle: "--rl-success-subtle",
  warning: "--rl-warning",
  warningSubtle: "--rl-warning-subtle",
  danger: "--rl-danger",
  dangerSubtle: "--rl-danger-subtle",
  info: "--rl-info",
  infoSubtle: "--rl-info-subtle",
  ring: "--rl-ring",
  ringOffset: "--rl-ring-offset",
} as const;

export type BrandColor = typeof brand;
export type NeutralColor = typeof neutral;
export type DarkColor = typeof dark;
export type CssVarName = (typeof cssVar)[keyof typeof cssVar];
