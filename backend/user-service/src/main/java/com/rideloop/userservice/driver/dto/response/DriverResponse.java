package com.rideloop.userservice.driver.dto.response;

import com.rideloop.userservice.driver.entity.enums.DriverStatus;
import com.rideloop.userservice.driver.vehicle.dto.response.VehicleResponse;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponse {

    private UUID driverId;

    private UUID userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String collegeName;

    private boolean collegeVerified;

    private String drivingLicenseNumber;

    private String licenseImageUrl;

    private DriverStatus status;

    private String rejectionReason;

    private VehicleResponse vehicle;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}