import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserMode = "RIDER" | "DRIVER";

type UIState = {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;

  profileMenuOpen: boolean;
  setProfileMenuOpen: (value: boolean) => void;

  currentMode: UserMode;
  setCurrentMode: (mode: UserMode) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      setSidebarOpen: (value) => set({ sidebarOpen: value }),

      profileMenuOpen: false,
      setProfileMenuOpen: (value) => set({ profileMenuOpen: value }),

      currentMode: "RIDER",
      setCurrentMode: (mode) => set({ currentMode: mode }),
    }),
    {
      name: "ui-storage",
    }
  )
);