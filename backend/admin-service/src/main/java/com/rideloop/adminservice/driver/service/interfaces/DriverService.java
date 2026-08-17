package com.rideloop.adminservice.driver.service.interfaces;

import com.rideloop.adminservice.driver.dto.response.DriverResponse;

import java.util.List;
import java.util.UUID;

public interface DriverService {

    List<DriverResponse> getAllDrivers(String status);

    List<DriverResponse> getPendingDrivers();

    DriverResponse getDriver(UUID driverId);

    void approveDriver(UUID driverId);

    void rejectDriver(UUID driverId);

    void rejectDriver(UUID driverId, String reason);

    void suspendDriver(UUID driverId, String reason);

    void restoreDriver(UUID driverId);
}