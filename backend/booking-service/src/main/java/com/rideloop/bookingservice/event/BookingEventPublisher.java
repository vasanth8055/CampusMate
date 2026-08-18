package com.rideloop.bookingservice.event;

import com.rideloop.commonevents.booking.BookingEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventPublisher {

    public static final String BOOKING_EVENTS_TOPIC =
            "booking-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(BookingEvent event) {

        String key = event.bookingId().toString();

        kafkaTemplate.send(
                        BOOKING_EVENTS_TOPIC,
                        key,
                        event
                )
                .whenComplete((result, exception) -> {

                    if (exception != null) {

                        log.error(
                                "Failed to publish booking event. " +
                                        "eventId={}, bookingId={}, type={}",
                                event.eventId(),
                                event.bookingId(),
                                event.eventType(),
                                exception
                        );

                        return;
                    }

                    log.info(
                            "Booking event published. " +
                                    "eventId={}, bookingId={}, type={}, partition={}, offset={}",
                            event.eventId(),
                            event.bookingId(),
                            event.eventType(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset()
                    );
                });
    }
}