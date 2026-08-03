package com.rideloop.userservice.driver.mapper;

import com.rideloop.userservice.driver.dto.response.DriverResponse;
import com.rideloop.userservice.driver.entity.DriverProfile;
import org.springframework.stereotype.Component;

@Component
public class DriverMapper {

    public DriverResponse toResponse(
            DriverProfile driver) {

        return DriverResponse.builder()
                .drivingLicenseNumber(
                        driver.getDrivingLicenseNumber()
                )
                .status(driver.getStatus())
                .build();
    }
}