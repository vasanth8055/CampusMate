import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse } from "../types/auth.types";

type AuthState = {
  user: AuthResponse | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (user: AuthResponse) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

     login: (user) => {
    localStorage.setItem("accessToken", user.accessToken);
    localStorage.setItem("refreshToken", user.refreshToken);

    set({
        user,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
    });
},

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
