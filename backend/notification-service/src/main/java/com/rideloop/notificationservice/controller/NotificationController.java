package com.rideloop.notificationservice.controller;

import com.rideloop.notificationservice.dto.response.NotificationResponse;
import com.rideloop.notificationservice.service.interfaces.NotificationService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(
        name = "Notification APIs",
        description = "APIs for managing RideLoop user notifications"
)
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get my notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>>
    getMyNotifications(
            @AuthenticationPrincipal AuthenticatedUser user) {

        List<NotificationResponse> notifications =
                notificationService.getMyNotifications(
                        user.getUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notifications fetched successfully",
                        notifications
                )
        );
    }

    @GetMapping("/unread")
    @Operation(summary = "Get my unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>>
    getUnreadNotifications(
            @AuthenticationPrincipal AuthenticatedUser user) {

        List<NotificationResponse> notifications =
                notificationService.getUnreadNotifications(
                        user.getUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Unread notifications fetched successfully",
                        notifications
                )
        );
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>>
    getUnreadCount(
            @AuthenticationPrincipal AuthenticatedUser user) {

        long count =
                notificationService.getUnreadCount(
                        user.getUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Unread notification count fetched successfully",
                        Map.of("count", count)
                )
        );
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>>
    markAsRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        NotificationResponse notification =
                notificationService.markAsRead(
                        notificationId,
                        user.getUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification marked as read",
                        notification
                )
        );
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>>
    markAllAsRead(
            @AuthenticationPrincipal AuthenticatedUser user) {

        notificationService.markAllAsRead(
                user.getUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All notifications marked as read",
                        null
                )
        );
    }
}