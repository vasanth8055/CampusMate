package com.rideloop.adminservice.client;

import com.rideloop.adminservice.booking.dto.response.BookingResponse;
import com.rideloop.adminservice.config.FeignConfig;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "booking-service", url = "${booking.service.url:http://booking-service:8083}", configuration = FeignConfig.class)
public interface BookingServiceClient {

    @GetMapping("/internal/v1/bookings")
    ApiResponse<List<BookingResponse>> getAllBookings();

    @GetMapping("/internal/v1/bookings/{bookingId}/details")
    ApiResponse<BookingResponse> getBookingDetails(
            @PathVariable("bookingId") UUID bookingId
    );
}
