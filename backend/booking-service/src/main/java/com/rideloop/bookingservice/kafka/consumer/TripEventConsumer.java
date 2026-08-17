package com.rideloop.bookingservice.kafka.consumer;

import com.rideloop.bookingservice.service.interfaces.BookingService;
import com.rideloop.commonevents.trip.TripCancelledEvent;
import com.rideloop.commonevents.trip.TripCompletedEvent;
import com.rideloop.commonevents.trip.TripStartedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripEventConsumer {

    private final BookingService bookingService;

    @KafkaListener(
            topics = "trip-events",
            groupId = "booking-service-trip-started"
    )
    public void onTripStarted(
            TripStartedEvent event) {

        log.info(
                "Trip started event received for trip {}. Updating active bookings to ONGOING.",
                event.tripId()
        );

        bookingService.handleTripStarted(event.tripId());
    }

    @KafkaListener(
            topics = "trip-events",
            groupId = "booking-service-trip-completed"
    )
    public void onTripCompleted(
            TripCompletedEvent event) {

        log.info(
                "Trip completed event received for trip {}. Completing associated bookings.",
                event.tripId()
        );

        bookingService.handleTripCompleted(event.tripId());
    }

    @KafkaListener(
            topics = "trip-events",
            groupId = "booking-service-trip-cancelled"
    )
    public void onTripCancelled(
            TripCancelledEvent event) {

        log.info(
                "Trip cancelled event received for trip {}. Cancelling associated bookings.",
                event.tripId()
        );

        bookingService.handleTripCancelled(event.tripId(), event.reason());
    }
}