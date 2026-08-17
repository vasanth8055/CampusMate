import { cssVar } from "../tokens/colors";

/**
 * Light theme semantic color values.
 * Applied to :root in theme.css.
 */
export const lightTheme = {
  [cssVar.background]: "#F8FAFC",
  [cssVar.surface]: "#FFFFFF",
  [cssVar.surfaceElevated]: "#FFFFFF",
  [cssVar.border]: "#E5E7EB",
  [cssVar.borderSubtle]: "#F1F5F9",
  [cssVar.foreground]: "#111827",
  [cssVar.foregroundSecondary]: "#6B7280",
  [cssVar.foregroundMuted]: "#9CA3AF",
  [cssVar.foregroundInverse]: "#F8FAFC",
  [cssVar.primary]: "#10B981",
  [cssVar.primaryHover]: "#059669",
  [cssVar.primaryPressed]: "#047857",
  [cssVar.primaryForeground]: "#FFFFFF",
  [cssVar.primarySubtle]: "#D1FAE5",
  [cssVar.secondary]: "#2563EB",
  [cssVar.secondaryHover]: "#1D4ED8",
  [cssVar.secondaryForeground]: "#FFFFFF",
  [cssVar.secondarySubtle]: "#DBEAFE",
  [cssVar.accent]: "#F59E0B",
  [cssVar.accentForeground]: "#111827",
  [cssVar.success]: "#22C55E",
  [cssVar.successSubtle]: "#DCFCE7",
  [cssVar.warning]: "#F59E0B",
  [cssVar.warningSubtle]: "#FEF3C7",
  [cssVar.danger]: "#EF4444",
  [cssVar.dangerSubtle]: "#FEE2E2",
  [cssVar.info]: "#3B82F6",
  [cssVar.infoSubtle]: "#DBEAFE",
  [cssVar.ring]: "#10B981",
  [cssVar.ringOffset]: "#F8FAFC",
} as const;

export type LightTheme = typeof lightTheme;
