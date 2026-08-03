package com.rideloop.commonevents.trip;

import java.time.LocalDateTime;
import java.util.UUID;

public record TripCancelledEvent(

        UUID tripId,

        UUID driverId,

        String reason,

        LocalDateTime cancelledAt

) {
}