package com.rideloop.userservice.driver.service.impl;

import com.rideloop.userservice.driver.dto.request.BecomeDriverRequest;
import com.rideloop.userservice.driver.dto.response.DriverResponse;
import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.entity.enums.DriverStatus;
import com.rideloop.userservice.driver.exception.DriverAlreadyExistsException;
import com.rideloop.userservice.driver.mapper.DriverMapper;
import com.rideloop.userservice.driver.repository.DriverProfileRepository;
import com.rideloop.userservice.driver.service.interfaces.DriverService;
import com.rideloop.userservice.driver.storage.StorageService;
import com.rideloop.userservice.user.entity.User;
import com.rideloop.userservice.user.entity.enums.UserRole;
import com.rideloop.userservice.user.entity.enums.UserStatus;
import com.rideloop.userservice.common.exception.ResourceNotFoundException;
import com.rideloop.userservice.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverProfileRepository driverRepository;
    private final UserRepository userRepository;
    private final DriverMapper driverMapper;
    private final StorageService storageService;
    @Override
    public DriverResponse becomeDriver(
            String userEmail,
            BecomeDriverRequest request) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!user.isEmailVerified()) {
            throw new IllegalStateException(
                    "Please verify your personal email first."
            );
        }

        if (!user.isCollegeVerified()) {
            throw new IllegalStateException(
                    "Please verify your college email first."
            );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException(
                    "User account is not active."
            );
        }

        if (driverRepository.existsByUser(user)) {
            throw new DriverAlreadyExistsException(
                    "Driver profile already exists."
            );
        }

        DriverProfile driver = DriverProfile.builder()
                .user(user)
                .drivingLicenseNumber(
                        request.getDrivingLicenseNumber()
                )
                .build();

        driver = driverRepository.save(driver);

        return driverMapper.toResponse(driver);
    }
    @Override
    public void uploadLicense(
            String userEmail,
            MultipartFile file) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found."
                        )
                );

        DriverProfile driver = driverRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Driver profile not found."
                        )
                );

        String imageUrl = storageService.store(file);

        driver.setLicenseImageUrl(imageUrl);

        driver.setStatus(
                DriverStatus.LICENSE_UPLOADED
        );

        driverRepository.save(driver);
    }
    @Override
    public List<DriverResponse> getPendingDrivers() {

        return driverRepository.findByStatus(DriverStatus.LICENSE_UPLOADED)
                .stream()
                .map(driverMapper::toResponse)
                .toList();
    }

    @Override
    public DriverResponse getDriver(UUID driverId) {

        DriverProfile driver = driverRepository.findById(driverId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Driver not found."));

        return driverMapper.toResponse(driver);
    }

    @Override
    public void approveDriver(UUID driverId) {

        DriverProfile driver = driverRepository.findById(driverId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Driver not found."));

        driver.setStatus(DriverStatus.APPROVED);

        User user = driver.getUser();
        user.setRole(UserRole.DRIVER);

        driverRepository.save(driver);
        userRepository.save(user);
    }

    @Override
    public void rejectDriver(UUID driverId) {

        DriverProfile driver = driverRepository.findById(driverId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Driver not found."));

        driver.setStatus(DriverStatus.REJECTED);

        driverRepository.save(driver);
    }
    @Override
    public boolean isDriverApproved(UUID driverId) {

        DriverProfile driver = driverRepository.findById(driverId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Driver not found."
                        )
                );

        return driver.getStatus() == DriverStatus.APPROVED;
    }
}