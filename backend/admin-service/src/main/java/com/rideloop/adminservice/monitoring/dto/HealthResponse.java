package com.rideloop.adminservice.monitoring.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthResponse {

    private double uptimePercent;
    private String globalStatus;
    private long avgLatencyMs;
    private int activeAlertsCount;
    private List<ServiceHealthItem> services;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceHealthItem {
        private String serviceId;
        private String serviceName;
        private String description;
        private String status; // OPERATIONAL, DEGRADED, DOWN
        private long responseTimeMs;
        private String lastCheck;
    }
}
