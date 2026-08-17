package com.rideloop.userservice.driver.vehicle.repository;

import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.vehicle.entity.Vehicle;
import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findAllByDriver(DriverProfile driver);

    Optional<Vehicle> findByDriverAndStatus(DriverProfile driver, VehicleStatus status);

    boolean existsByDriver(DriverProfile driver);

    boolean existsByRegistrationNumber(String registrationNumber);
}