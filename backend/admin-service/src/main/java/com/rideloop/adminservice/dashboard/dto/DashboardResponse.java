package com.rideloop.adminservice.dashboard.dto;

import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.trip.dto.response.TripResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalUsers;
    private long verifiedStudents;
    private long totalDrivers;
    private long approvedDrivers;
    private long pendingDrivers;
    private long totalTrips;
    private long activeTrips;
    private long completedTrips;
    private long cancelledTrips;
    private long totalBookings;
    private BigDecimal totalRevenue;

    private List<DriverResponse> pendingApplications;
    private List<TripResponse> activeRides;
    private List<ActivityItem> recentActivity;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityItem {
        private String id;
        private String title;
        private String description;
        private String type; // USER_REGISTERED, DRIVER_APPLIED, TRIP_CREATED, TRIP_COMPLETED, BOOKING_CREATED
        private String status;
        private LocalDateTime timestamp;
    }
}