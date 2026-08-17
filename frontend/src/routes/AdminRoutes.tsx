import { Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminUserDetailsPage from "@/pages/admin/AdminUserDetailsPage";
import AdminApplicationsPage from "@/pages/admin/AdminApplicationsPage";
import AdminDriversPage from "@/pages/admin/AdminDriversPage";
import AdminVehiclesPage from "@/pages/admin/AdminVehiclesPage";
import AdminTripsPage from "@/pages/admin/AdminTripsPage";
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage";
import AdminActiveRidesPage from "@/pages/admin/AdminActiveRidesPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminNotificationsPage from "@/pages/admin/AdminNotificationsPage";
import AdminSystemHealthPage from "@/pages/admin/AdminSystemHealthPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminRoute from "@/routes/AdminRoute";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Admin login (anonymous) */}
      <Route path="login" element={<AdminLoginPage />} />

      {/* Protected admin routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:userId" element={<AdminUserDetailsPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="drivers" element={<AdminDriversPage />} />
          <Route path="vehicles" element={<AdminVehiclesPage />} />
          <Route path="trips" element={<AdminTripsPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="active-rides" element={<AdminActiveRidesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="health" element={<AdminSystemHealthPage />} />
          <Route path="system-health" element={<Navigate to="health" replace />} />
          <Route path="driver-applications" element={<Navigate to="applications" replace />} />
          <Route path="settings" element={<AdminSettingsPage />} />

          {/* default to dashboard when visiting /admin/ */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
