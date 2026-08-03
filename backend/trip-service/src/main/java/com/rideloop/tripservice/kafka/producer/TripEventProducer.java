package com.rideloop.tripservice.kafka.producer;

import com.rideloop.commonevents.trip.TripCancelledEvent;
import com.rideloop.commonevents.trip.TripCompletedEvent;
import com.rideloop.commonevents.trip.TripStartedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TripEventProducer {

    private static final String TOPIC = "trip-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishTripStarted(TripStartedEvent event) {

        kafkaTemplate.send(
                TOPIC,
                event.tripId().toString(),
                event
        );
    }

    public void publishTripCompleted(TripCompletedEvent event) {

        kafkaTemplate.send(
                TOPIC,
                event.tripId().toString(),
                event
        );
    }

    public void publishTripCancelled(TripCancelledEvent event) {

        kafkaTemplate.send(
                TOPIC,
                event.tripId().toString(),
                event
        );
    }
}