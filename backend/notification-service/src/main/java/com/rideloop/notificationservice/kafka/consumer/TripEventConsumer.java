package com.rideloop.notificationservice.kafka.consumer;

import com.rideloop.commonevents.trip.TripCancelledEvent;
import com.rideloop.commonevents.trip.TripCompletedEvent;
import com.rideloop.commonevents.trip.TripStartedEvent;
import com.rideloop.notificationservice.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor

public class TripEventConsumer {
    private final NotificationService notificationService;
    @KafkaListener(
            topics = "trip-events",
            groupId = "notification-service"
    )
    public void onTripStarted(
            TripStartedEvent event) {

        log.info(
                "Trip Started: {}",
                event
        );

        // TODO
        // notificationService.notifyRideStarted(...)
        notificationService.notifyTripStarted(
                event.tripId(),
                event.driverId()
        );
    }

    @KafkaListener(
            topics = "trip-events",
            groupId = "notification-service"
    )
    public void onTripCompleted(
            TripCompletedEvent event) {

        log.info(
                "Trip Completed: {}",
                event
        );

        // TODO
        // notificationService.notifyRideCompleted(...)
        notificationService.notifyTripCompleted(
                event.tripId(),
                event.driverId()
        );
    }

    @KafkaListener(
            topics = "trip-events",
            groupId = "notification-service"
    )
    public void onTripCancelled(
            TripCancelledEvent event) {

        log.info(
                "Trip Cancelled: {}",
                event
        );

        // TODO
        // notificationService.notifyRideCancelled(...)
        notificationService.notifyTripCancelled(
                event.tripId(),
                event.driverId(),
                event.reason()
        );
    }
}