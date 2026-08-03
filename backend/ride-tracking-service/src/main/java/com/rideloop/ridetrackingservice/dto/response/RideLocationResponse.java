package com.rideloop.ridetrackingservice.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record RideLocationResponse(

        UUID id,

        UUID tripId,

        UUID driverId,

        Double latitude,

        Double longitude,

        Double speed,

        Double heading,

        Double accuracy,

        LocalDateTime recordedAt,

        LocalDateTime createdAt
) {
}