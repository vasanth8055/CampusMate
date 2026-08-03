package com.rideloop.adminservice.driver.dto.response;

import com.rideloop.adminservice.auth.dto.enums.DriverStatus;
import lombok.*;

import java.util.UUID;


    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public  class DriverResponse {

        private UUID driverId;

        private UUID userId;

        private String firstName;

        private String lastName;

        private String email;

        private String drivingLicenseNumber;

        private String licenseImageUrl;

        private DriverStatus status;
    }

