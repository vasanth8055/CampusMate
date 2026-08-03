package com.rideloop.adminservice.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalUsers;

    private long totalDrivers;

    private long pendingDrivers;

    private long totalTrips;

    private long activeTrips;

    private long totalBookings;

}