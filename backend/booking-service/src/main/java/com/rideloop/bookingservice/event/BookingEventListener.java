package com.rideloop.bookingservice.event;

import com.rideloop.commonevents.booking.BookingEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventListener {

    private final BookingEventPublisher bookingEventPublisher;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleBookingEvent(
            BookingEvent event) {

        log.debug(
                "Database transaction committed. Publishing booking event {}",
                event.eventType()
        );

        bookingEventPublisher.publish(event);
    }
}