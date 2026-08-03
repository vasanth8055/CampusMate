package com.rideloop.commonevents.trip;

import java.time.LocalDateTime;
import java.util.UUID;

public record TripCompletedEvent(

        UUID tripId,

        UUID driverId,

        LocalDateTime completedAt

) {
}