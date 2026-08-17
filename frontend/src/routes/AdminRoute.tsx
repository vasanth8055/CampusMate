import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getAdminProfile } from "@/features/admin/api/adminAuth.api";
import { useAdminAuthStore } from "@/features/admin/store/adminAuth.store";

export default function AdminRoute() {
  const accessToken = useAdminAuthStore((s) => s.accessToken);

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "current"],
    queryFn: getAdminProfile,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  const admin = data?.data;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <Navigate to="/admin/login" replace />;

  if (!admin || admin.role !== "ADMIN") {
    // Not authorized to access admin pages
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
