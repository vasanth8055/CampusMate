package com.rideloop.userservice.driver.dto.response;

import com.rideloop.userservice.driver.entity.enums.DriverStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DriverResponse {

    private String drivingLicenseNumber;

    private DriverStatus status;
}