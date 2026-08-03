package com.rideloop.paymentservice.dto.client;

import java.util.UUID;

public record BookingInfoResponse(

        UUID id,

        UUID tripId,

        UUID riderId,

        UUID driverId,

        Integer requestedSeats,

        String status

) {
}