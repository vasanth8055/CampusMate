package com.rideloop.notificationservice.repository;

import com.rideloop.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    /**
     * Returns all notifications belonging to a user,
     * newest notifications first.
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(
            UUID userId
    );

    /**
     * Returns only unread notifications belonging to a user,
     * newest notifications first.
     */
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(
            UUID userId
    );

    /**
     * Returns the number of unread notifications for a user.
     */
    long countByUserIdAndReadFalse(
            UUID userId
    );

    /**
     * Finds a notification only when it belongs to the given user.
     * This prevents users from accessing another user's notification.
     */
    Optional<Notification> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    /**
     * Marks all unread notifications belonging to a user as read.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Notification n
            SET n.read = true,
                n.readAt = CURRENT_TIMESTAMP
            WHERE n.userId = :userId
              AND n.read = false
            """)
    int markAllAsRead(
            @Param("userId") UUID userId
    );
}