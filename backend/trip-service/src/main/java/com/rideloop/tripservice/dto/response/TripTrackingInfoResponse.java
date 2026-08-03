package com.rideloop.tripservice.dto.response;

import java.util.UUID;

public record TripTrackingInfoResponse(

        UUID id,

        UUID driverId,

        String status
) {
}