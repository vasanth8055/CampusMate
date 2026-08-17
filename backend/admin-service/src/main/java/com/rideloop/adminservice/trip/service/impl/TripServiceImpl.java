package com.rideloop.adminservice.trip.service.impl;

import com.rideloop.adminservice.client.TripServiceClient;
import com.rideloop.adminservice.logging.AuditLogger;
import com.rideloop.adminservice.trip.dto.response.TripResponse;
import com.rideloop.adminservice.trip.service.interfaces.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripServiceClient tripServiceClient;
    private final AuditLogger auditLogger;

    @Override
    public List<TripResponse> getAllTrips(String status, UUID driverId) {
        return tripServiceClient.getAllTrips(status, driverId).getData();
    }

    @Override
    public List<TripResponse> getActiveTrips() {
        return tripServiceClient.getActiveTrips().getData();
    }

    @Override
    public TripResponse getTripDetails(UUID tripId) {
        return tripServiceClient.getTripDetails(tripId).getData();
    }

    @Override
    public TripResponse cancelTrip(UUID tripId, UUID driverId) {
        TripResponse res = tripServiceClient.cancelTrip(tripId, driverId).getData();
        auditLogger.log("Admin cancelled trip: " + tripId);
        return res;
    }
}
