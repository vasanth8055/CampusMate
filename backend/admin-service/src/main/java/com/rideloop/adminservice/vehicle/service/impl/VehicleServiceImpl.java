package com.rideloop.adminservice.vehicle.service.impl;

import com.rideloop.adminservice.client.UserServiceClient;
import com.rideloop.adminservice.driver.dto.response.VehicleResponse;
import com.rideloop.adminservice.logging.AuditLogger;
import com.rideloop.adminservice.vehicle.service.interfaces.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final UserServiceClient userServiceClient;
    private final AuditLogger auditLogger;

    @Override
    public List<VehicleResponse> getAllVehicles() {
        return userServiceClient.getAllVehicles().getData();
    }

    @Override
    public VehicleResponse getVehicle(UUID vehicleId) {
        return userServiceClient.getVehicle(vehicleId).getData();
    }

    @Override
    public void approveVehicle(UUID vehicleId) {
        userServiceClient.approveVehicle(vehicleId);
        auditLogger.log("Approved vehicle: " + vehicleId);
    }

    @Override
    public void deactivateVehicle(UUID vehicleId) {
        userServiceClient.deactivateVehicle(vehicleId);
        auditLogger.log("Deactivated vehicle: " + vehicleId);
    }

    @Override
    public void reactivateVehicle(UUID vehicleId) {
        userServiceClient.reactivateVehicle(vehicleId);
        auditLogger.log("Reactivated vehicle: " + vehicleId);
    }
}
