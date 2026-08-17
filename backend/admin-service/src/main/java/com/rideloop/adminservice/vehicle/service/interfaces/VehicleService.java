package com.rideloop.adminservice.vehicle.service.interfaces;

import com.rideloop.adminservice.driver.dto.response.VehicleResponse;

import java.util.List;
import java.util.UUID;

public interface VehicleService {

    List<VehicleResponse> getAllVehicles();

    VehicleResponse getVehicle(UUID vehicleId);

    void approveVehicle(UUID vehicleId);

    void deactivateVehicle(UUID vehicleId);

    void reactivateVehicle(UUID vehicleId);
}
