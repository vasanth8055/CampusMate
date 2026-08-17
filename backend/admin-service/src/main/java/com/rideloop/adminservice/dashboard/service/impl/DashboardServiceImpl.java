package com.rideloop.adminservice.dashboard.service.impl;

import com.rideloop.adminservice.booking.dto.response.BookingResponse;
import com.rideloop.adminservice.client.BookingServiceClient;
import com.rideloop.adminservice.client.TripServiceClient;
import com.rideloop.adminservice.client.UserServiceClient;
import com.rideloop.adminservice.dashboard.dto.DashboardResponse;
import com.rideloop.adminservice.dashboard.service.interfaces.DashboardService;
import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.trip.dto.response.TripResponse;
import com.rideloop.adminservice.user.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final UserServiceClient userServiceClient;
    private final TripServiceClient tripServiceClient;
    private final BookingServiceClient bookingServiceClient;

    @Override
    public DashboardResponse getDashboard() {
        List<UserResponse> users = Collections.emptyList();
        List<DriverResponse> pendingDrivers = Collections.emptyList();
        List<DriverResponse> allDrivers = Collections.emptyList();
        List<TripResponse> allTrips = Collections.emptyList();
        List<TripResponse> activeTrips = Collections.emptyList();
        List<BookingResponse> allBookings = Collections.emptyList();

        try {
            var res = userServiceClient.getUsers();
            if (res != null && res.getData() != null) {
                users = res.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch users for admin dashboard: {}", e.getMessage());
        }

        try {
            var res = userServiceClient.getPendingDrivers();
            if (res != null && res.getData() != null) {
                pendingDrivers = res.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch pending drivers for admin dashboard: {}", e.getMessage());
        }

        try {
            var res = userServiceClient.getAllDrivers(null);
            if (res != null && res.getData() != null) {
                allDrivers = res.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch all drivers for admin dashboard: {}", e.getMessage());
        }

        try {
            var res = tripServiceClient.getAllTrips(null, null);
            if (res != null && res.getData() != null) {
                allTrips = res.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch trips for admin dashboard: {}", e.getMessage());
        }

        try {
            var res = tripServiceClient.getActiveTrips();
            if (res != null && res.getData() != null) {
                activeTrips = res.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch active trips for admin dashboard: {}", e.getMessage());
        }

        try {
            var res = bookingServiceClient.getAllBookings();
            if (res != null && res.getData() != null) {
                allBookings = res.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch bookings for admin dashboard: {}", e.getMessage());
        }

        long totalUsers = users.size();
        long verifiedStudents = users.stream().filter(UserResponse::isCollegeVerified).count();
        long approvedDrivers = allDrivers.stream()
                .filter(d -> d.getStatus() != null && "APPROVED".equalsIgnoreCase(d.getStatus().name()))
                .count();
        if (approvedDrivers == 0) {
            approvedDrivers = users.stream()
                    .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("DRIVER"))
                    .count();
        }
        long pendingDriversCount = pendingDrivers.size();

        long totalTrips = allTrips.size();
        long activeTripsCount = activeTrips.size();
        long completedTrips = allTrips.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();
        long cancelledTrips = allTrips.stream()
                .filter(t -> "CANCELLED".equalsIgnoreCase(t.getStatus()))
                .count();

        long totalBookings = allBookings.size();
        BigDecimal totalRevenue = BigDecimal.valueOf(totalBookings * 45.0); // estimated platform transacted volume

        // Build recent chronological activity
        List<DashboardResponse.ActivityItem> activityList = new ArrayList<>();

        for (var u : users) {
            activityList.add(DashboardResponse.ActivityItem.builder()
                    .id("USR-" + u.getId())
                    .title("New User Registered")
                    .description(u.getFirstName() + " " + u.getLastName() + " (" + u.getEmail() + ") joined CampusMate.")
                    .type("USER_REGISTERED")
                    .status("ACTIVE")
                    .timestamp(u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.now().minusHours(2))
                    .build());
        }

        for (var d : pendingDrivers) {
            activityList.add(DashboardResponse.ActivityItem.builder()
                    .id("DRV-" + d.getDriverId())
                    .title("Driver Application Submitted")
                    .description(d.getFirstName() + " " + d.getLastName() + " submitted DL & vehicle details for review.")
                    .type("DRIVER_APPLIED")
                    .status("PENDING")
                    .timestamp(d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.now().minusMinutes(30))
                    .build());
        }

        for (var t : allTrips) {
            activityList.add(DashboardResponse.ActivityItem.builder()
                    .id("TRP-" + t.getId())
                    .title("Trip Created: " + t.getSource() + " ➔ " + t.getDestination())
                    .description("Driver scheduled commute with " + t.getTotalSeats() + " seats.")
                    .type("TRIP_CREATED")
                    .status(t.getStatus())
                    .timestamp(t.getCreatedAt() != null ? t.getCreatedAt() : LocalDateTime.now().minusHours(1))
                    .build());
        }

        activityList.sort(Comparator.comparing(DashboardResponse.ActivityItem::getTimestamp).reversed());
        List<DashboardResponse.ActivityItem> topActivity = activityList.stream().limit(10).toList();

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .verifiedStudents(verifiedStudents)
                .totalDrivers(allDrivers.size())
                .approvedDrivers(approvedDrivers)
                .pendingDrivers(pendingDriversCount)
                .totalTrips(totalTrips)
                .activeTrips(activeTripsCount)
                .completedTrips(completedTrips)
                .cancelledTrips(cancelledTrips)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .pendingApplications(pendingDrivers)
                .activeRides(activeTrips)
                .recentActivity(topActivity)
                .build();
    }
}