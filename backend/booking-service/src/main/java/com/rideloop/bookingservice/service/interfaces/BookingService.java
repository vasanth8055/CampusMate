package com.rideloop.bookingservice.service.interfaces;

import com.rideloop.bookingservice.dto.request.CreateBookingRequest;
import com.rideloop.bookingservice.dto.response.BookingResponse;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    BookingResponse createBooking(
            UUID riderId,
            CreateBookingRequest request
    );

    BookingResponse getBookingById(
            UUID bookingId,
            UUID authenticatedUserId
    );

    List<BookingResponse> getRiderBookings(
            UUID riderId
    );

    List<BookingResponse> getDriverBookings(
            UUID driverId
    );

    List<BookingResponse> getTripBookings(
            UUID tripId,
            UUID driverId
    );

    BookingResponse acceptBooking(
            UUID bookingId,
            UUID driverId
    );

    BookingResponse rejectBooking(
            UUID bookingId,
            UUID driverId
    );

    BookingResponse cancelBooking(
            UUID bookingId,
            UUID riderId
    );

    BookingResponse confirmBooking(
            UUID bookingId,
            UUID authenticatedUserId
    );

    BookingResponse startBooking(
            UUID bookingId,
            UUID driverId
    );

    BookingResponse completeBooking(
            UUID bookingId,
            UUID driverId
    );

    void handleTripStarted(
            UUID tripId
    );

    void handleTripCompleted(
            UUID tripId
    );

    void handleTripCancelled(
            UUID tripId,
            String reason
    );

    List<BookingResponse> getAllBookingsAdmin();

    BookingResponse getBookingAdmin(UUID bookingId);
}