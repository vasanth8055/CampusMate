package com.rideloop.notificationservice.event;

import com.rideloop.commonevents.payment.PaymentEvent;
import com.rideloop.commonevents.payment.PaymentEventType;
import com.rideloop.notificationservice.entity.Notification;
import com.rideloop.notificationservice.entity.enums.NotificationType;
import com.rideloop.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "kafka.listener.payment.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final NotificationRepository notificationRepository;

    @KafkaListener(
            topics = "rideloop.payment.events",
            groupId = "notification-service"
    )
    public void consume(PaymentEvent event) {

        log.info(
                "Received payment event. eventId={}, paymentId={}, type={}",
                event.eventId(),
                event.paymentId(),
                event.eventType()
        );

        if (event.eventType() == PaymentEventType.PAYMENT_SUCCESS) {

            Notification notification =
                    Notification.builder()
                            .userId(event.riderId())
                            .type(NotificationType.PAYMENT_SUCCESS)
                            .title("Payment successful")
                            .message(
                                    "Your payment of ₹"
                                            + event.amount()
                                            + " was completed successfully."
                            )
                            .bookingId(event.bookingId())
                            .build();

            notificationRepository.save(notification);
        }
    }
}