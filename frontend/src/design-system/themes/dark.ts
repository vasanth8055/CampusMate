import { cssVar } from "../tokens/colors";

/**
 * Dark theme semantic color values.
 * Applied to .dark in theme.css.
 */
export const darkTheme = {
  [cssVar.background]: "#0F172A",
  [cssVar.surface]: "#1E293B",
  [cssVar.surfaceElevated]: "#334155",
  [cssVar.border]: "#334155",
  [cssVar.borderSubtle]: "#1E293B",
  [cssVar.foreground]: "#F8FAFC",
  [cssVar.foregroundSecondary]: "#94A3B8",
  [cssVar.foregroundMuted]: "#64748B",
  [cssVar.foregroundInverse]: "#111827",
  [cssVar.primary]: "#10B981",
  [cssVar.primaryHover]: "#059669",
  [cssVar.primaryPressed]: "#047857",
  [cssVar.primaryForeground]: "#FFFFFF",
  [cssVar.primarySubtle]: "#064E3B",
  [cssVar.secondary]: "#2563EB",
  [cssVar.secondaryHover]: "#1D4ED8",
  [cssVar.secondaryForeground]: "#FFFFFF",
  [cssVar.secondarySubtle]: "#1E3A8A",
  [cssVar.accent]: "#F59E0B",
  [cssVar.accentForeground]: "#111827",
  [cssVar.success]: "#22C55E",
  [cssVar.successSubtle]: "#14532D",
  [cssVar.warning]: "#F59E0B",
  [cssVar.warningSubtle]: "#78350F",
  [cssVar.danger]: "#EF4444",
  [cssVar.dangerSubtle]: "#7F1D1D",
  [cssVar.info]: "#3B82F6",
  [cssVar.infoSubtle]: "#1E3A8A",
  [cssVar.ring]: "#10B981",
  [cssVar.ringOffset]: "#0F172A",
} as const;

export type DarkTheme = typeof darkTheme;
