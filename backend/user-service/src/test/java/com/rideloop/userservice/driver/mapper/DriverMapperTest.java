package com.rideloop.userservice.driver.mapper;

import com.rideloop.userservice.driver.dto.response.DriverResponse;
import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.entity.enums.DriverStatus;
import com.rideloop.userservice.driver.storage.StorageService;
import com.rideloop.userservice.driver.vehicle.mapper.VehicleMapper;
import com.rideloop.userservice.driver.vehicle.repository.VehicleRepository;
import com.rideloop.userservice.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class DriverMapperTest {

    private VehicleRepository vehicleRepository;
    private VehicleMapper vehicleMapper;
    private StorageService storageService;
    private DriverMapper driverMapper;

    @BeforeEach
    void setUp() {
        vehicleRepository = Mockito.mock(VehicleRepository.class);
        vehicleMapper = Mockito.mock(VehicleMapper.class);
        storageService = Mockito.mock(StorageService.class);
        driverMapper = new DriverMapper(vehicleRepository, vehicleMapper, storageService);

        when(vehicleRepository.findByDriverAndStatus(any(), any())).thenReturn(Optional.empty());
        when(vehicleRepository.findAllByDriver(any())).thenReturn(java.util.Collections.emptyList());
    }

    @Test
    void testToResponse_ResolvesSignedLicenseUrl() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("driver@college.edu")
                .firstName("Alex")
                .lastName("Rider")
                .build();

        DriverProfile driver = DriverProfile.builder()
                .id(UUID.randomUUID())
                .user(user)
                .drivingLicenseNumber("DL-123456")
                .licenseImageUrl("user-123/uuid-photo.png")
                .status(DriverStatus.LICENSE_UPLOADED)
                .build();

        when(storageService.getSignedUrl("user-123/uuid-photo.png"))
                .thenReturn("https://mock.supabase.co/storage/v1/object/sign/licenses/user-123/uuid-photo.png?token=signedtoken123");

        DriverResponse response = driverMapper.toResponse(driver);

        assertNotNull(response);
        assertEquals("DL-123456", response.getDrivingLicenseNumber());
        assertEquals("https://mock.supabase.co/storage/v1/object/sign/licenses/user-123/uuid-photo.png?token=signedtoken123", response.getLicenseImageUrl());
        assertEquals(DriverStatus.LICENSE_UPLOADED, response.getStatus());
    }

    @Test
    void testToResponse_GracefulFallbackWhenStorageReturnsNull() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("driver@college.edu")
                .firstName("Alex")
                .lastName("Rider")
                .build();

        DriverProfile driver = DriverProfile.builder()
                .id(UUID.randomUUID())
                .user(user)
                .drivingLicenseNumber("DL-123456")
                .licenseImageUrl("user-123/uuid-photo.png")
                .status(DriverStatus.LICENSE_UPLOADED)
                .build();

        when(storageService.getSignedUrl("user-123/uuid-photo.png"))
                .thenReturn(null);

        DriverResponse response = driverMapper.toResponse(driver);

        assertNotNull(response);
        assertEquals("DL-123456", response.getDrivingLicenseNumber());
        assertNull(response.getLicenseImageUrl());
        assertEquals(DriverStatus.LICENSE_UPLOADED, response.getStatus());
    }
}
