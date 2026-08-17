package com.rideloop.adminservice.booking.service.interfaces;

import com.rideloop.adminservice.booking.dto.response.BookingResponse;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    List<BookingResponse> getAllBookings();

    BookingResponse getBookingDetails(UUID bookingId);
}
