package com.rideloop.adminservice.booking.service.impl;

import com.rideloop.adminservice.booking.dto.response.BookingResponse;
import com.rideloop.adminservice.booking.service.interfaces.BookingService;
import com.rideloop.adminservice.client.BookingServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingServiceClient bookingServiceClient;

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingServiceClient.getAllBookings().getData();
    }

    @Override
    public BookingResponse getBookingDetails(UUID bookingId) {
        return bookingServiceClient.getBookingDetails(bookingId).getData();
    }
}
