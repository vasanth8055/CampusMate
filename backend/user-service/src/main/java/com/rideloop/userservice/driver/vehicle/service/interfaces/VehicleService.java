package com.rideloop.userservice.driver.vehicle.service.interfaces;

import com.rideloop.userservice.driver.vehicle.dto.request.CreateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.request.UpdateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.response.VehicleResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface VehicleService {

    VehicleResponse registerVehicle(
            String userEmail,
            CreateVehicleRequest request
    );

    VehicleResponse getMyVehicle(
            String userEmail
    );

    List<VehicleResponse> getAllVehicles(
            String userEmail
    );

    VehicleResponse activateVehicle(
            String userEmail,
            UUID vehicleId
    );

    VehicleResponse updateVehicle(
            String userEmail,
            UpdateVehicleRequest request
    );

    void uploadRcImage(
            String userEmail,
            MultipartFile file
    );

    void deleteVehicle(
            String userEmail
    );

    VehicleResponse getVehicle(
            UUID vehicleId
    );

    VehicleResponse getVehicleByDriver(
            UUID driverId
    );

    List<VehicleResponse> getAllVehiclesAdmin();

    void approveVehicle(UUID vehicleId);

    void deactivateVehicle(UUID vehicleId);

    void reactivateVehicle(UUID vehicleId);
}