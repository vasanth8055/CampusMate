package com.rideloop.bookingservice.kafka.consumer;

import com.rideloop.commonevents.trip.TripCompletedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TripEventConsumer {

    @KafkaListener(
            topics = "trip-events",
            groupId = "booking-service"
    )
    public void onTripCompleted(
            TripCompletedEvent event) {

        log.info(
                "Closing bookings for trip {}",
                event.tripId()
        );

        // TODO
        // bookingService.closeBookings(event.tripId());
    }
}