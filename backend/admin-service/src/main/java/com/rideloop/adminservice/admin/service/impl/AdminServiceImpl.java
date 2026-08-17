package com.rideloop.adminservice.admin.service.impl;

import com.rideloop.adminservice.admin.service.interfaces.AdminService;
import com.rideloop.adminservice.client.UserServiceClient;
import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.user.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserServiceClient userServiceClient;

    // ---------------- Driver ----------------

    @Override
    public List<DriverResponse> getPendingDrivers() {
        return userServiceClient
                .getPendingDrivers()
                .getData();
    }

    @Override
    public DriverResponse getDriver(UUID driverId) {
        return userServiceClient
                .getDriver(driverId)
                .getData();
    }

    @Override
    public void approveDriver(UUID driverId) {
        userServiceClient.approveDriver(driverId);
    }

    @Override
    public void rejectDriver(UUID driverId) {
        userServiceClient.rejectDriver(driverId, null);
    }

    @Override
    public void rejectDriver(UUID driverId, String reason) {
        userServiceClient.rejectDriver(driverId, reason);
    }

    // ---------------- User ----------------

    @Override
    public List<UserResponse> getUsers() {
        return userServiceClient
                .getUsers()
                .getData();
    }

    @Override
    public UserResponse getUser(UUID userId) {
        return userServiceClient
                .getUser(userId)
                .getData();
    }

    @Override
    public void blockUser(UUID userId) {
        userServiceClient.blockUser(userId);
    }

    @Override
    public void unblockUser(UUID userId) {
        userServiceClient.unblockUser(userId);
    }
}