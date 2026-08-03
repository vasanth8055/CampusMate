package com.rideloop.adminservice.driver.service.impl;

import com.rideloop.adminservice.client.UserServiceClient;
import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.driver.service.interfaces.DriverService;
import com.rideloop.adminservice.logging.AuditLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final UserServiceClient userServiceClient;
    private final AuditLogger auditLogger;
    @Override
    public List<DriverResponse> getPendingDrivers() {
        return userServiceClient.getPendingDrivers().getData();
    }

    @Override
    public DriverResponse getDriver(UUID driverId) {
        return userServiceClient.getDriver(driverId).getData();
    }

    @Override
    public void approveDriver(UUID driverId) {
        userServiceClient.approveDriver(driverId);
        auditLogger.log("Approved driver: " + driverId);
    }

    @Override
    public void rejectDriver(UUID driverId) {
        userServiceClient.rejectDriver(driverId);
        auditLogger.log("Rejected driver: " + driverId);
    }
}