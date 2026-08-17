import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import DriverLayout from "@/layouts/DriverLayout";

import DriverDashboardPage from "@/pages/driver/DriverDashboardPage";
import MyTripsPage from "@/pages/driver/MyTripsPage";
import CreateTripPage from "@/pages/driver/CreateTripPage";
import EditTripPage from "@/pages/driver/EditTripPage";
import TripDetailsDriverPage from "@/pages/driver/TripDetailsDriverPage";
import BookingRequestsPage from "@/pages/driver/BookingRequestsPage";
import PassengersPage from "@/pages/driver/PassengersPage";
import DriverProfilePage from "@/pages/driver/DriverProfilePage";
import DriverSettingsPage from "@/pages/driver/DriverSettingsPage";
import PaymentHistoryPage from "@/pages/driver/PaymentHistoryPage";
import VehiclePage from "@/pages/driver/VehiclePage";
export default function DriverRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<DriverLayout />}>
          <Route index element={<Navigate to="/driver/dashboard" replace />} />

          <Route path="dashboard" element={<DriverDashboardPage />} />
          <Route path="trips" element={<MyTripsPage />} />
          <Route path="trips/create" element={<CreateTripPage />} />
          <Route path="vehicle" element={<VehiclePage />} />
          <Route path="trips/:tripId" element={<TripDetailsDriverPage />} />
          <Route path="trips/:tripId/edit" element={<EditTripPage />} />
          <Route path="bookings" element={<BookingRequestsPage />} />
          <Route path="passengers/:tripId" element={<PassengersPage />} />
          <Route path="profile" element={<DriverProfilePage />} />
          <Route path="settings" element={<DriverSettingsPage />} />
          <Route path="payments" element={<PaymentHistoryPage />} />
        </Route>
      </Route>
    </Routes>
  );
}