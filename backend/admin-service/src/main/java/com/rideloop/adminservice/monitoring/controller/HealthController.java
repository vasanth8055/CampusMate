package com.rideloop.adminservice.monitoring.controller;

import com.rideloop.adminservice.monitoring.dto.HealthResponse;
import com.rideloop.adminservice.monitoring.service.interfaces.HealthService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> getHealth() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "System health fetched successfully.",
                        healthService.getSystemHealth()
                )
        );
    }
}
