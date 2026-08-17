package com.rideloop.userservice.driver.vehicle.service.impl;

import com.rideloop.userservice.common.exception.ResourceNotFoundException;
import com.rideloop.userservice.driver.entity.enums.DriverStatus;
import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.repository.DriverProfileRepository;
import com.rideloop.userservice.driver.storage.StorageService;
import com.rideloop.userservice.driver.vehicle.dto.request.CreateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.request.UpdateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.response.VehicleResponse;
import com.rideloop.userservice.driver.vehicle.entity.Vehicle;
import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleStatus;
import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleType;
import com.rideloop.userservice.driver.vehicle.exception.InvalidVehicleCapacityException;
import com.rideloop.userservice.driver.vehicle.exception.VehicleAlreadyExistsException;
import com.rideloop.userservice.driver.vehicle.exception.VehicleNotFoundException;
import com.rideloop.userservice.driver.vehicle.exception.VehicleRegistrationAlreadyExistsException;
import com.rideloop.userservice.driver.vehicle.mapper.VehicleMapper;
import com.rideloop.userservice.driver.vehicle.repository.VehicleRepository;
import com.rideloop.userservice.driver.vehicle.service.interfaces.VehicleService;
import com.rideloop.userservice.user.entity.User;
import com.rideloop.userservice.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverProfileRepository driverRepository;
    private final UserRepository userRepository;
    private final VehicleMapper vehicleMapper;
    private final StorageService storageService;

    @Override
    public VehicleResponse registerVehicle(
            String userEmail,
            CreateVehicleRequest request) {

        User user = getUser(userEmail);
        DriverProfile driver = getDriverProfile(user);

        validateCapacity(
                request.vehicleType(),
                request.maxPassengerCapacity()
        );

        var existingWithReg = vehicleRepository.findAllByDriver(driver).stream()
                .filter(v -> v.getRegistrationNumber().equalsIgnoreCase(request.registrationNumber().trim()))
                .findFirst();

        if (existingWithReg.isPresent()) {
            Vehicle vehicle = existingWithReg.get();
            vehicle.setVehicleType(request.vehicleType());
            vehicle.setBrand(request.brand());
            vehicle.setModel(request.model());
            vehicle.setColor(request.color());
            vehicle.setRegistrationNumber(request.registrationNumber().trim());
            vehicle.setMaxPassengerCapacity(request.maxPassengerCapacity());
            return vehicleMapper.toResponse(vehicleRepository.save(vehicle));
        }

        if (vehicleRepository.existsByRegistrationNumber(request.registrationNumber().trim())) {
            throw new VehicleRegistrationAlreadyExistsException(
                    "Registration number already exists."
            );
        }

        // Set previous vehicles to INACTIVE so new vehicle is ACTIVE by default
        List<Vehicle> driverVehicles = vehicleRepository.findAllByDriver(driver);
        for (Vehicle v : driverVehicles) {
            v.setStatus(VehicleStatus.INACTIVE);
            vehicleRepository.save(v);
        }

        Vehicle vehicle = vehicleMapper.toEntity(request, driver);
        vehicle.setRegistrationNumber(request.registrationNumber().trim());
        vehicle.setStatus(VehicleStatus.ACTIVE);

        return vehicleMapper.toResponse(
                vehicleRepository.save(vehicle)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getMyVehicle(String userEmail) {

        User user = getUser(userEmail);
        DriverProfile driver = getDriverProfile(user);

        Vehicle vehicle = vehicleRepository.findByDriverAndStatus(driver, VehicleStatus.ACTIVE)
                .or(() -> vehicleRepository.findAllByDriver(driver).stream().findFirst())
                .orElseThrow(() ->
                        new VehicleNotFoundException(
                                "Vehicle not found."
                        ));

        return vehicleMapper.toResponse(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles(String userEmail) {

        User user = getUser(userEmail);
        DriverProfile driver = getDriverProfile(user);

        return vehicleRepository.findAllByDriver(driver)
                .stream()
                .map(vehicleMapper::toResponse)
                .toList();
    }

    @Override
    public VehicleResponse activateVehicle(String userEmail, UUID vehicleId) {

        User user = getUser(userEmail);
        DriverProfile driver = getDriverProfile(user);

        List<Vehicle> vehicles = vehicleRepository.findAllByDriver(driver);
        Vehicle target = vehicles.stream()
                .filter(v -> v.getId().equals(vehicleId))
                .findFirst()
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found: " + vehicleId));

        for (Vehicle v : vehicles) {
            if (v.getId().equals(vehicleId)) {
                v.setStatus(VehicleStatus.ACTIVE);
            } else {
                v.setStatus(VehicleStatus.INACTIVE);
            }
            vehicleRepository.save(v);
        }

        return vehicleMapper.toResponse(target);
    }

    @Override
    public VehicleResponse updateVehicle(
            String userEmail,
            UpdateVehicleRequest request) {

        User user = getUser(userEmail);
        DriverProfile driver = getDriverProfile(user);

        Vehicle vehicle = vehicleRepository.findByDriverAndStatus(driver, VehicleStatus.ACTIVE)
                .or(() -> vehicleRepository.findAllByDriver(driver).stream().findFirst())
                .orElseThrow(() ->
                        new VehicleNotFoundException(
                                "Vehicle not found."
                        ));

        validateCapacity(
                request.vehicleType(),
                request.maxPassengerCapacity()
        );

        if (!vehicle.getRegistrationNumber()
                .equalsIgnoreCase(request.registrationNumber().trim())
                &&
                vehicleRepository.existsByRegistrationNumber(
                        request.registrationNumber().trim())) {

            throw new VehicleRegistrationAlreadyExistsException(
                    "Registration number already exists."
            );
        }

        vehicleMapper.updateVehicle(request, vehicle);

        return vehicleMapper.toResponse(
                vehicleRepository.save(vehicle)
        );
    }

    @Override
    public void uploadRcImage(
            String userEmail,
            MultipartFile file) {

        User user = getUser(userEmail);
        DriverProfile driver = getDriverProfile(user);

        Vehicle vehicle = vehicleRepository.findByDriverAndStatus(driver, VehicleStatus.ACTIVE)
                .or(() -> vehicleRepository.findAllByDriver(driver).stream().findFirst())
                .orElseThrow(() ->
                        new VehicleNotFoundException(
                                "Vehicle not found."
                        ));

        String path = storageService.store(file);
        vehicle.setRcImageUrl(path);
        vehicleRepository.save(vehicle);
    }

    @Override
    public void deleteVehicle(String userEmail) {

        User user = getUser(userEmail);
        DriverProfile driver = getDriverProfile(user);

        Vehicle vehicle = vehicleRepository.findByDriverAndStatus(driver, VehicleStatus.ACTIVE)
                .or(() -> vehicleRepository.findAllByDriver(driver).stream().findFirst())
                .orElseThrow(() ->
                        new VehicleNotFoundException(
                                "Vehicle not found."
                        ));

        vehicleRepository.delete(vehicle);

        // If other vehicles exist, activate the next one
        List<Vehicle> remaining = vehicleRepository.findAllByDriver(driver);
        if (!remaining.isEmpty() && remaining.stream().noneMatch(v -> v.getStatus() == VehicleStatus.ACTIVE)) {
            Vehicle next = remaining.get(0);
            next.setStatus(VehicleStatus.ACTIVE);
            vehicleRepository.save(next);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getVehicle(UUID vehicleId) {

        return vehicleMapper.toResponse(
                vehicleRepository.findById(vehicleId)
                        .orElseThrow(() ->
                                new VehicleNotFoundException(
                                        "Vehicle not found."
                                ))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleByDriver(UUID driverId) {

        DriverProfile driver =
                driverRepository.findById(driverId)
                        .or(() -> driverRepository.findByUser_Id(driverId))
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Driver not found."
                                ));

        Vehicle vehicle = vehicleRepository.findByDriverAndStatus(driver, VehicleStatus.ACTIVE)
                .or(() -> vehicleRepository.findAllByDriver(driver).stream().findFirst())
                .orElseThrow(() ->
                        new VehicleNotFoundException(
                                "Vehicle not found."
                        ));

        return vehicleMapper.toResponse(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehiclesAdmin() {
        return vehicleRepository.findAll()
                .stream()
                .map(vehicleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void approveVehicle(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found."));
        vehicle.setStatus(VehicleStatus.ACTIVE);
        vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public void deactivateVehicle(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found."));
        vehicle.setStatus(VehicleStatus.INACTIVE);
        vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public void reactivateVehicle(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found."));
        vehicle.setStatus(VehicleStatus.ACTIVE);
        vehicleRepository.save(vehicle);
    }

    private User getUser(String identifier) {
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

    private DriverProfile getDriverProfile(User user) {

        return driverRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Driver profile not found."
                        ));
    }

    private void validateCapacity(
            VehicleType type,
            Integer capacity) {

        switch (type) {

            case BIKE, SCOOTER -> {
                if (capacity != 1) {
                    throw new InvalidVehicleCapacityException(
                            "Bike and Scooter must have exactly 1 passenger seat."
                    );
                }
            }

            case AUTO -> {
                if (capacity < 1 || capacity > 3) {
                    throw new InvalidVehicleCapacityException(
                            "Auto must have between 1 and 3 passenger seats."
                    );
                }
            }

            case CAR -> {
                if (capacity < 1 || capacity > 6) {
                    throw new InvalidVehicleCapacityException(
                            "Car must have between 1 and 6 passenger seats."
                    );
                }
            }
        }
    }
}