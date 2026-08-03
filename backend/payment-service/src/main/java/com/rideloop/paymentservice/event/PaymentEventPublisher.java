package com.rideloop.paymentservice.event;

import com.rideloop.commonevents.payment.PaymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    public static final String PAYMENT_EVENTS_TOPIC =
            "rideloop.payment.events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(PaymentEvent event) {

        String key = event.paymentId().toString();

        kafkaTemplate.send(
                        PAYMENT_EVENTS_TOPIC,
                        key,
                        event
                )
                .whenComplete((result, exception) -> {

                    if (exception != null) {

                        log.error(
                                "Failed to publish payment event. " +
                                        "eventId={}, paymentId={}, type={}",
                                event.eventId(),
                                event.paymentId(),
                                event.eventType(),
                                exception
                        );

                        return;
                    }

                    log.info(
                            "Payment event published. " +
                                    "eventId={}, paymentId={}, type={}, partition={}, offset={}",
                            event.eventId(),
                            event.paymentId(),
                            event.eventType(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset()
                    );
                });
    }
}