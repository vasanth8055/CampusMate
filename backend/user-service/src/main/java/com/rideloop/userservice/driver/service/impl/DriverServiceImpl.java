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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverProfileRepository driverRepository;
    private final UserRepository userRepository;
    private final DriverMapper driverMapper;
    private final StorageService storageService;

    private User findUserByEmailOrId(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new ResourceNotFoundException("User identifier cannot be empty.");
        }
        try {
            UUID id = UUID.fromString(identifier.trim());
            return userRepository.findById(id)
                    .or(() -> userRepository.findByEmail(identifier.trim()))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + identifier));
        } catch (IllegalArgumentException e) {
            return userRepository.findByEmail(identifier.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + identifier));
        }
    }

    @Override
    public DriverResponse becomeDriver(
            String userEmail,
            BecomeDriverRequest request) {

        User user = findUserByEmailOrId(userEmail);

        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please verify your personal email first."
            );
        }

        if (!user.isCollegeVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please verify your college email first."
            );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User account is not active."
            );
        }

        DriverProfile driver;

        if (driverRepository.existsByUser(user)) {
            DriverProfile existingDriver = driverRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found."));

            if (existingDriver.getStatus() == DriverStatus.REJECTED) {
                existingDriver.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
                existingDriver.setStatus(DriverStatus.PENDING);
                driver = driverRepository.save(existingDriver);
                return driverMapper.toResponse(driver);
            }

            throw new DriverAlreadyExistsException(
                    "Driver profile already exists."
            );
        }

        driver = DriverProfile.builder()
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

        User user = findUserByEmailOrId(userEmail);

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
    @Transactional(readOnly = true)
    public List<DriverResponse> getPendingDrivers() {
        return driverRepository.findAll()
                .stream()
                .filter(d -> d.getStatus() == DriverStatus.LICENSE_UPLOADED ||
                             d.getStatus() == DriverStatus.PENDING ||
                             d.getStatus() == DriverStatus.UNDER_REVIEW)
                .map(driverMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers(DriverStatus status) {
        return driverRepository.findAll()
                .stream()
                .filter(d -> status == null || d.getStatus() == status)
                .map(driverMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponse getDriver(UUID driverId) {

        DriverProfile driver = findDriverByIdOrUserId(driverId);

        return driverMapper.toResponse(driver);
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponse getMyDriver(String userEmail) {
        User user = findUserByEmailOrId(userEmail);

        DriverProfile driver = driverRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Driver profile not found for user: " + user.getEmail()));

        return driverMapper.toResponse(driver);
    }

    @Override
    @Transactional
    public void approveDriver(UUID driverId) {

        DriverProfile driver = findDriverByIdOrUserId(driverId);

        driver.setStatus(DriverStatus.APPROVED);
        driver.setReviewedAt(java.time.LocalDateTime.now());

        User user = driver.getUser();
        user.setRole(UserRole.DRIVER);

        driverRepository.save(driver);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void rejectDriver(UUID driverId) {
        rejectDriver(driverId, "Application does not meet community safety guidelines.");
    }

    @Override
    @Transactional
    public void rejectDriver(UUID driverId, String reason) {

        DriverProfile driver = findDriverByIdOrUserId(driverId);

        driver.setStatus(DriverStatus.REJECTED);
        driver.setRejectionReason(reason != null && !reason.isBlank() ? reason : "Application does not meet requirements.");
        driver.setReviewedAt(java.time.LocalDateTime.now());

        driverRepository.save(driver);
    }

    @Override
    @Transactional
    public void suspendDriver(UUID driverId, String reason) {

        DriverProfile driver = findDriverByIdOrUserId(driverId);

        driver.setStatus(DriverStatus.SUSPENDED);
        driver.setRejectionReason(reason != null && !reason.isBlank() ? reason : "Suspended by Administrator.");
        driver.setReviewedAt(java.time.LocalDateTime.now());

        driverRepository.save(driver);
    }

    @Override
    @Transactional
    public void restoreDriver(UUID driverId) {

        DriverProfile driver = findDriverByIdOrUserId(driverId);

        driver.setStatus(DriverStatus.APPROVED);
        driver.setRejectionReason(null);
        driver.setReviewedAt(java.time.LocalDateTime.now());

        User user = driver.getUser();
        user.setRole(UserRole.DRIVER);

        driverRepository.save(driver);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isDriverApproved(UUID driverId) {

        DriverProfile driver = findDriverByIdOrUserId(driverId);

        return driver.getStatus() == DriverStatus.APPROVED;
    }

    private DriverProfile findDriverByIdOrUserId(UUID id) {
        return driverRepository.findById(id)
                .or(() -> driverRepository.findByUser_Id(id))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Driver not found."));
    }
}