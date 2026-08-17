import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminAuthState = {
  admin: { email: string; firstName?: string; lastName?: string; role?: string } | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (payload: { admin: any; accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
};

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,

      login: ({ admin, accessToken, refreshToken }) => {
        localStorage.setItem("adminAccessToken", accessToken);
        if (refreshToken) localStorage.setItem("adminRefreshToken", refreshToken);
        set({ admin, accessToken, refreshToken: refreshToken ?? null });
      },

      logout: () => {
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        set({ admin: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (s) => ({ admin: s.admin, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);
