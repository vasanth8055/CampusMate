package com.rideloop.ridetrackingservice.kafka.consumer;

import com.rideloop.commonevents.trip.TripCompletedEvent;
import com.rideloop.commonevents.trip.TripStartedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TripEventConsumer {

    @KafkaListener(
            topics = "trip-events",
            groupId = "ride-tracking-service"
    )
    public void onTripStarted(
            TripStartedEvent event) {

        log.info(
                "Tracking enabled for trip {}",
                event.tripId()
        );

        // TODO
        // trackingService.enableTracking(event.tripId());
    }

    @KafkaListener(
            topics = "trip-events",
            groupId = "ride-tracking-service"
    )
    public void onTripCompleted(
            TripCompletedEvent event) {

        log.info(
                "Tracking stopped for trip {}",
                event.tripId()
        );

        // TODO
        // trackingService.disableTracking(event.tripId());
    }
}