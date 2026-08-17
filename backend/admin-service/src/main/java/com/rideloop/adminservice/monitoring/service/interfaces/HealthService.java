package com.rideloop.adminservice.monitoring.service.interfaces;

import com.rideloop.adminservice.monitoring.dto.HealthResponse;

public interface HealthService {

    HealthResponse getSystemHealth();
}
