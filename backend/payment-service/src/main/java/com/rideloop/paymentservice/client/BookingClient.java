package com.rideloop.paymentservice.client;

import com.rideloop.paymentservice.dto.client.BookingInfoResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "booking-service")
public interface BookingClient {

    @GetMapping("/api/v1/bookings/{bookingId}")
    ApiResponse<BookingInfoResponse> getBooking(
            @PathVariable("bookingId") UUID bookingId
    );
}