package com.rideloop.notificationservice.service.interfaces;

import com.rideloop.notificationservice.dto.response.NotificationResponse;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    List<NotificationResponse> getMyNotifications(UUID userId);

    List<NotificationResponse> getUnreadNotifications(UUID userId);

    long getUnreadCount(UUID userId);

    NotificationResponse markAsRead(
            UUID notificationId,
            UUID userId
    );

    void markAllAsRead(UUID userId);
    void notifyTripStarted(
            UUID tripId,
            UUID driverId
    );

    void notifyTripCompleted(
            UUID tripId,
            UUID driverId
    );

    void notifyTripCancelled(
            UUID tripId,
            UUID driverId,
            String reason
    );
}