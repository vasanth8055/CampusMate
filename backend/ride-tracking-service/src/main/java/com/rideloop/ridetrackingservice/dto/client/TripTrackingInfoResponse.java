package com.rideloop.ridetrackingservice.dto.client;

import java.util.UUID;

public record TripTrackingInfoResponse(

        UUID id,

        UUID driverId,

        String status
) {
}