package com.rideloop.ridetrackingservice.client;

import com.rideloop.ridetrackingservice.dto.client.TripTrackingInfoResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "trip-service")
public interface TripClient {

    @GetMapping("/internal/v1/trips/{tripId}/tracking")
    ApiResponse<TripTrackingInfoResponse> getTrackingInfo(
            @PathVariable("tripId") UUID tripId
    );
}