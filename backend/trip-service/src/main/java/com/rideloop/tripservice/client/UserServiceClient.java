package com.rideloop.tripservice.client;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.tripservice.dto.response.DriverInfoResponse;
import com.rideloop.tripservice.dto.response.VehicleResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service", url = "${user.service.url:http://localhost:8081}")
public interface UserServiceClient {


    @GetMapping("/api/v1/internal/drivers/{driverId}/approved")
    ApiResponse<Boolean> isDriverApproved(
            @PathVariable UUID driverId
    );

    @GetMapping("/api/v1/internal/drivers/{driverId}")
    ApiResponse<DriverInfoResponse> getDriver(
            @PathVariable UUID driverId
    );

    @GetMapping("/api/v1/internal/vehicles/driver/{driverId}")
    ApiResponse<VehicleResponse> getVehicleByDriver(
            @PathVariable UUID driverId
    );
}