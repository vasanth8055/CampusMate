package com.rideloop.userservice.driver.repository;

import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.entity.enums.DriverStatus;
import com.rideloop.userservice.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverProfileRepository
        extends JpaRepository<DriverProfile, UUID> {

    Optional<DriverProfile> findByUser(User user);

    Optional<DriverProfile> findByUser_Id(UUID userId);

    boolean existsByUser(User user);

    List<DriverProfile> findByStatus(DriverStatus status);
}