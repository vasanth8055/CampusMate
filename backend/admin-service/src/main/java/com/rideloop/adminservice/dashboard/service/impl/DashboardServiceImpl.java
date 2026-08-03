package com.rideloop.adminservice.dashboard.service.impl;

import com.rideloop.adminservice.client.UserServiceClient;
import com.rideloop.adminservice.dashboard.dto.DashboardResponse;
import com.rideloop.adminservice.dashboard.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserServiceClient userServiceClient;

    @Override
    public DashboardResponse getDashboard() {

        long totalUsers =
                userServiceClient.getUsers()
                        .getData()
                        .size();

        long pendingDrivers =
                userServiceClient.getPendingDrivers()
                        .getData()
                        .size();

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalDrivers(0)
                .pendingDrivers(pendingDrivers)
                .totalTrips(0)
                .activeTrips(0)
                .totalBookings(0)
                .build();
    }
}