package com.rideloop.notificationservice.event;

import com.rideloop.commonevents.booking.BookingEvent;
import com.rideloop.notificationservice.entity.Notification;
import com.rideloop.notificationservice.entity.enums.NotificationType;
import com.rideloop.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventConsumer {

    private final NotificationRepository notificationRepository;

    @KafkaListener(
            topics = "booking-events",
            groupId = "notification-service"
    )
    public void consume(BookingEvent event) {

        log.info(
                "Received booking event: type={}, bookingId={}",
                event.eventType(),
                event.bookingId()
        );

        switch (event.eventType()) {

            case BOOKING_REQUESTED ->
                    create(
                            event.driverId(),
                            NotificationType.BOOKING_REQUESTED,
                            "New booking request",
                            "A rider requested "
                                    + event.requestedSeats()
                                    + " seat(s) on your trip.",
                            event
                    );

            case BOOKING_ACCEPTED ->
                    create(
                            event.riderId(),
                            NotificationType.BOOKING_ACCEPTED,
                            "Booking accepted",
                            "Your booking request has been accepted.",
                            event
                    );

            case BOOKING_REJECTED ->
                    create(
                            event.riderId(),
                            NotificationType.BOOKING_REJECTED,
                            "Booking rejected",
                            "Your booking request has been rejected.",
                            event
                    );

            case BOOKING_CANCELLED -> {
                    create(
                            event.driverId(),
                            NotificationType.BOOKING_CANCELLED,
                            "Booking cancelled",
                            "A rider cancelled their booking.",
                            event
                    );
                    create(
                            event.riderId(),
                            NotificationType.BOOKING_CANCELLED,
                            "Booking cancelled",
                            "The booking or ride has been cancelled.",
                            event
                    );
            }

            case BOOKING_CONFIRMED ->
                    create(
                            event.driverId(),
                            NotificationType.BOOKING_CONFIRMED,
                            "Booking confirmed",
                            "The rider confirmed the booking.",
                            event
                    );

            case BOOKING_STARTED ->
                    create(
                            event.riderId(),
                            NotificationType.BOOKING_STARTED,
                            "Ride started",
                            "Your ride has started.",
                            event
                    );

            case BOOKING_COMPLETED ->
                    create(
                            event.riderId(),
                            NotificationType.BOOKING_COMPLETED,
                            "Ride completed",
                            "Your ride has been completed.",
                            event
                    );
        }
    }

    private void create(
            UUID userId,
            NotificationType type,
            String title,
            String message,
            BookingEvent event) {

        Notification notification =
                Notification.builder()
                        .userId(userId)
                        .type(type)
                        .title(title)
                        .message(message)
                        .bookingId(event.bookingId())
                        .tripId(event.tripId())
                        .read(false)
                        .build();

        notificationRepository.save(notification);

        log.info(
                "Notification created for user={}, type={}",
                userId,
                type
        );
    }
}