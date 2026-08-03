package com.rideloop.commonevents.booking;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookingEvent(

        UUID eventId,

        BookingEventType eventType,

        UUID bookingId,

        UUID tripId,

        UUID riderId,

        UUID driverId,

        Integer requestedSeats,

        LocalDateTime occurredAt

) {
}