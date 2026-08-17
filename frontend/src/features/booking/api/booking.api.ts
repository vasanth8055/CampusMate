import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { TripResponse } from "@/features/trip/types/trip.types";
import { getTrip } from "@/features/trip/api/trip.api";
import { getUserById } from "@/features/profile/api/profile.api";
import type { BookingResponse, CreateBookingRequest, EnrichedDriverBooking } from "../types/booking.types";

export const createBooking = async (payload: CreateBookingRequest) => {
  const { data } = await api.post<ApiResponse<BookingResponse>>( "/api/v1/bookings", payload);
  return data;
};

export const getBooking = async (bookingId: string) => {
  const { data } = await api.get<ApiResponse<BookingResponse>>(`/api/v1/bookings/${bookingId}`);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await api.get<ApiResponse<BookingResponse[]>>("/api/v1/bookings/me");
  return data;
};

export const getDriverBookings = async () => {
  const { data } = await api.get<ApiResponse<BookingResponse[]>>("/api/v1/bookings/driver/me");
  return data;
};

export const getDriverBookingsWithDetails = async (): Promise<EnrichedDriverBooking[]> => {
  const res = await getDriverBookings();
  const bookings = res.data ?? [];

  const details = await Promise.all(
    bookings.map(async (booking) => {
      let trip: TripResponse | undefined;
      let rider: any | undefined;
      try {
        const tripRes = await getTrip(booking.tripId);
        trip = tripRes.data;
      } catch {}
      try {
        const riderRes = await getUserById(booking.riderId);
        rider = (riderRes as any)?.data || riderRes;
      } catch {}
      return { booking, trip, rider };
    })
  );

  return details;
};

export const getTripBookings = async (tripId: string) => {
  const { data } = await api.get<ApiResponse<BookingResponse[]>>(`/api/v1/bookings/trip/${tripId}`);
  return data;
};

export const getTripBookingsWithDetails = async (tripId: string): Promise<EnrichedDriverBooking[]> => {
  const res = await getTripBookings(tripId);
  const bookings = res.data ?? [];

  const details = await Promise.all(
    bookings.map(async (booking) => {
      let rider: any | undefined;
      try {
        const riderRes = await getUserById(booking.riderId);
        rider = (riderRes as any)?.data || riderRes;
      } catch {}
      return { booking, rider };
    })
  );

  return details;
};

export const acceptBooking = async (bookingId: string) => {
  const { data } = await api.put<ApiResponse<BookingResponse>>(`/api/v1/bookings/${bookingId}/accept`);
  return data;
};

export const rejectBooking = async (bookingId: string) => {
  const { data } = await api.put<ApiResponse<BookingResponse>>(`/api/v1/bookings/${bookingId}/reject`);
  return data;
};

export const cancelBooking = async (bookingId: string) => {
  const { data } = await api.put<ApiResponse<BookingResponse>>(`/api/v1/bookings/${bookingId}/cancel`);
  return data;
};

export const confirmBooking = async (bookingId: string) => {
  const { data } = await api.put<ApiResponse<BookingResponse>>(`/api/v1/bookings/${bookingId}/confirm`);
  return data;
};

export const startBooking = async (bookingId: string) => {
  const { data } = await api.put<ApiResponse<BookingResponse>>(`/api/v1/bookings/${bookingId}/start`);
  return data;
};

export const getMyBookingsWithTrips = async (): Promise<Array<{ booking: BookingResponse; trip?: TripResponse }>> => {
  const bookingsResponse = await getMyBookings();
  const bookings = bookingsResponse.data ?? [];

  const bookingTripPairs = await Promise.all(
    bookings.map(async (booking) => {
      try {
        const tripResponse = await getTrip(booking.tripId);
        return { booking, trip: tripResponse.data };
      } catch {
        return { booking, trip: undefined };
      }
    })
  );
  return bookingTripPairs;
};

export const completeBooking = async (bookingId: string) => {
  const { data } = await api.put<ApiResponse<BookingResponse>>(`/api/v1/bookings/${bookingId}/complete`);
  return data;
};

