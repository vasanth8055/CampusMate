import { Navigate, Route, Routes } from "react-router-dom";

import BookingsPage from "@/pages/rider/BookingsPage";
import BecomeDriverPage from "@/pages/rider/BecomeDriverPage";
import DashboardPage from "@/pages/rider/DashboardPage";
import FindRidesPage from "@/pages/rider/FindRidesPage";
import HistoryPage from "@/pages/rider/HistoryPage";
import NotificationsPage from "@/pages/rider/NotificationsPage";
import ProfilePage from "@/pages/rider/ProfilePage";
import TripDetailsPage from "@/pages/rider/TripDetailsPage";
import TrackingPage from "@/pages/rider/TrackingPage";

import RiderLayout from "@/layouts/RiderLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";

export default function RiderRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<RiderLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="find-rides" element={<FindRidesPage />} />
          <Route path="search-results" element={<FindRidesPage />} />
          <Route path="trips/:tripId" element={<TripDetailsPage />} />
          <Route path="track/:tripId" element={<TrackingPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="my-rides" element={<BookingsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<ProfilePage />} />
          <Route path="become-driver" element={<BecomeDriverPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
