package com.rideloop.tripservice.client;

import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/v1/internal/drivers/{driverId}/approved")
    ApiResponse<Boolean> isDriverApproved(
            @PathVariable UUID driverId
    );

}