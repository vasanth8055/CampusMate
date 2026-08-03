package com.rideloop.adminservice.dashboard.controller;

import com.rideloop.adminservice.dashboard.dto.DashboardResponse;
import com.rideloop.adminservice.dashboard.service.interfaces.DashboardService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard fetched successfully.",
                        dashboardService.getDashboard()
                )
        );
    }
}