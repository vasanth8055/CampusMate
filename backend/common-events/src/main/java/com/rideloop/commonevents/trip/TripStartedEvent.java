package com.rideloop.commonevents.trip;

import java.time.LocalDateTime;
import java.util.UUID;

public record TripStartedEvent(

        UUID tripId,

        UUID driverId,

        LocalDateTime startedAt

) {
}