package com.rideloop.ridetrackingservice.service.interfaces;

import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;

import java.util.UUID;

public interface LocationCacheService {

    void saveLatestLocation(
            RideLocationResponse location
    );

    RideLocationResponse getLatestLocation(
            UUID tripId
    );
}