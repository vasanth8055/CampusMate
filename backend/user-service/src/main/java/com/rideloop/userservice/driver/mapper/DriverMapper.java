package com.rideloop.userservice.driver.mapper;

import com.rideloop.userservice.driver.dto.response.DriverResponse;
import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.vehicle.mapper.VehicleMapper;
import com.rideloop.userservice.driver.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DriverMapper {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;

    public DriverResponse toResponse(DriverProfile driver) {
        var user = driver.getUser();

        var vehicleOpt = vehicleRepository.findByDriverAndStatus(driver, com.rideloop.userservice.driver.vehicle.entity.enums.VehicleStatus.ACTIVE)
                .or(() -> vehicleRepository.findAllByDriver(driver).stream().findFirst());
        var vehicleResponse = vehicleOpt.map(vehicleMapper::toResponse).orElse(null);

        return DriverResponse.builder()
                .driverId(driver.getId())
                .userId(user != null ? user.getId() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .email(user != null ? user.getEmail() : null)
                .phoneNumber(user != null ? user.getPhoneNumber() : null)
                .collegeVerified(user != null && user.isCollegeVerified())
                .drivingLicenseNumber(driver.getDrivingLicenseNumber())
                .licenseImageUrl(driver.getLicenseImageUrl())
                .status(driver.getStatus())
                .rejectionReason(driver.getRejectionReason())
                .vehicle(vehicleResponse)
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}