package com.rideloop.adminservice.driver.service.interfaces;

import com.rideloop.adminservice.driver.dto.response.DriverResponse;

import java.util.List;
import java.util.UUID;

public interface DriverService {

    List<DriverResponse> getPendingDrivers();

    DriverResponse getDriver(UUID driverId);

    void approveDriver(UUID driverId);

    void rejectDriver(UUID driverId);
}