package com.rideloop.notificationservice.dto.response;

import com.rideloop.notificationservice.entity.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(

        UUID id,
        UUID userId,
        NotificationType type,
        String title,
        String message,
        UUID bookingId,
        UUID tripId,
        boolean read,
        LocalDateTime createdAt,
        LocalDateTime readAt

) {
}