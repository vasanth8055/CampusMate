import { cssVar } from "../tokens/colors";
import type { CssVarName } from "../tokens/colors";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";

export type ThemeName = "light" | "dark";

export type ThemeTokens = Record<CssVarName, string>;

export const themes: Record<ThemeName, ThemeTokens> = {
  light: lightTheme,
  dark: darkTheme,
};

export function getThemeTokens(name: ThemeName): ThemeTokens {
  return themes[name];
}

export { lightTheme, darkTheme, cssVar };
