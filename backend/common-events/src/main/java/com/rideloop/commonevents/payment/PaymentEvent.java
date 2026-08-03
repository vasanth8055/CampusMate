package com.rideloop.commonevents.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentEvent(

        UUID eventId,
        PaymentEventType eventType,

        UUID paymentId,
        UUID bookingId,
        UUID riderId,
        UUID driverId,

        BigDecimal amount,
        String currency,

        LocalDateTime occurredAt

) {
}