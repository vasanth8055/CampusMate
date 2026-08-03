package com.rideloop.notificationservice.service.impl;

import com.rideloop.notificationservice.dto.response.NotificationResponse;
import com.rideloop.notificationservice.entity.Notification;
import com.rideloop.notificationservice.entity.enums.NotificationType;
import com.rideloop.notificationservice.repository.NotificationRepository;
import com.rideloop.notificationservice.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<NotificationResponse> getMyNotifications(UUID userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {

        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public long getUnreadCount(UUID userId) {

        return notificationRepository
                .countByUserIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(
            UUID notificationId,
            UUID userId) {

        Notification notification =
                notificationRepository
                        .findByIdAndUserId(notificationId, userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"
                                )
                        );

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        }

        return toResponse(
                notificationRepository.save(notification)
        );
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationResponse toResponse(
            Notification notification) {

        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getBookingId(),
                notification.getTripId(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
    @Override
    @Transactional
    public void notifyTripStarted(
            UUID tripId,
            UUID driverId) {

        Notification notification =
                Notification.builder()
                        .userId(driverId)
                        .type(NotificationType.RIDE_STARTED)
                        .title("Ride Started")
                        .message("Your ride has started successfully.")
                        .tripId(tripId)
                        .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifyTripCompleted(
            UUID tripId,
            UUID driverId) {

        Notification notification =
                Notification.builder()
                        .userId(driverId)
                        .type(NotificationType.RIDE_COMPLETED)
                        .title("Ride Completed")
                        .message("Your ride has been completed successfully.")
                        .tripId(tripId)
                        .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifyTripCancelled(
            UUID tripId,
            UUID driverId,
            String reason) {

        Notification notification =
                Notification.builder()
                        .userId(driverId)
                        .type(NotificationType.RIDE_CANCELLED)
                        .title("Ride Cancelled")
                        .message(reason)
                        .tripId(tripId)
                        .build();

        notificationRepository.save(notification);
    }
}