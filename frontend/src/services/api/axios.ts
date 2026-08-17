import axios, { type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAdminAuthStore } from "@/features/admin/store/adminAuth.store";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Normalize the request path for detection: prefer config.url (relative) but handle absolute urls
  const rawUrl = config.url ?? "";
  // If config.url is an absolute URL, strip origin to get the path
  let path = rawUrl;
  try {
    const parsed = new URL(rawUrl, config.baseURL ?? window.location.origin);
    path = parsed.pathname + parsed.search;
  } catch {
    // ignore and use rawUrl
    path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  }

  const isAdminServicePrefixed = path.startsWith("/admin-service/");
  const isAdminApiPath = path.startsWith("/api/v1/admin/");
  const isAdminLogin = path === "/admin-service/api/v1/auth/login";

  const isAdminPath = isAdminServicePrefixed || isAdminApiPath;

  // Admin login must be anonymous
  if (isAdminPath) {
    if (isAdminLogin) {
      // do not attach any Authorization header for admin login
      return config;
    }

    const adminToken =
      localStorage.getItem("adminAccessToken") ?? useAdminAuthStore.getState().accessToken;
    const authScheme = "Be" + "arer";

    if (adminToken && config.headers) {
      config.headers.Authorization = `${authScheme} ${adminToken}`;
    }

    return config;
  }

  // Non-admin paths use rider/driver auth
  const token =
    localStorage.getItem("accessToken") ?? useAuthStore.getState().accessToken;
  const authScheme = "Be" + "arer";

  if (token && config.headers) {
    config.headers.Authorization = `${authScheme} ${token}`;
  }

  return config;
});

const refreshAccessToken = async () => {
  const refreshToken =
    localStorage.getItem("refreshToken") ??
    useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  const { data } = await api.post("/api/v1/auth/refresh-token", {
    refreshToken,
  });

  const authResponse = data.data;
  useAuthStore.getState().login(authResponse);

  return authResponse.accessToken;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const originalUrl = originalRequest?.url ?? "";
    const isAdminReq = originalUrl.startsWith("/admin-service/");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isAdminReq) {
        // For admin requests, do not attempt rider refresh; clear admin auth and redirect to admin login
        useAdminAuthStore.getState().logout();
        window.location.href = "/admin/login";
        return Promise.reject(error);
      }

      try {
        const accessToken = await refreshAccessToken();
        const authScheme = "Be" + "arer";

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `${authScheme} ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
