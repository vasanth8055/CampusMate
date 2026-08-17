/**
 * RideLoop Design System — public API.
 *
 * Usage:
 *   import { brand, textUtility, radius } from "@/design-system";
 *   import { getThemeTokens } from "@/design-system/themes";
 */

export * from "./tokens";
export * from "./themes";

/** Read a CSS custom property at runtime (e.g. for maps/charts). */
export function getCssVar(name: string, fallback = ""): string {
  if (typeof document === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}

/** Apply a theme token object to the document root (testing / Storybook). */
export function applyThemeTokens(
  tokens: Record<string, string>,
  target: HTMLElement = document.documentElement
): void {
  Object.entries(tokens).forEach(([key, value]) => {
    target.style.setProperty(key, value);
  });
}
