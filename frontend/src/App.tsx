import { useEffect } from "react";

import AppRouter from "@/routes/AppRouter";
import { applyTheme, useThemeStore } from "@/store/theme.store";

export default function App() {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  return <AppRouter />;
}