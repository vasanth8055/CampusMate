package com.rideloop.ridetrackingservice.service.interfaces;

import com.rideloop.ridetrackingservice.dto.request.LocationUpdateRequest;
import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;

import java.util.List;
import java.util.UUID;

public interface RideTrackingService {

    RideLocationResponse updateLocation(
            UUID driverId,
            UUID tripId,
            LocationUpdateRequest request
    );

    RideLocationResponse getLatestLocation(
            UUID tripId
    );

    List<RideLocationResponse> getRideHistory(
            UUID tripId
    );
}