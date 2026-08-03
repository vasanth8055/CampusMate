package com.rideloop.adminservice.admin.service.interfaces;

import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.user.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface AdminService {

    // Driver

    List<DriverResponse> getPendingDrivers();

    DriverResponse getDriver(UUID driverId);

    void approveDriver(UUID driverId);

    void rejectDriver(UUID driverId);

    // User

    List<UserResponse> getUsers();

    UserResponse getUser(UUID userId);

    void blockUser(UUID userId);

    void unblockUser(UUID userId);

}