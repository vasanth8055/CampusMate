package com.rideloop.paymentservice.client;

import com.rideloop.paymentservice.dto.client.TripInfoResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "trip-service", url = "${trip.service.url:http://localhost:8082}")
public interface TripClient {


    @GetMapping("/api/v1/trips/{tripId}")
    ApiResponse<TripInfoResponse> getTrip(
            @PathVariable("tripId") UUID tripId
    );
}