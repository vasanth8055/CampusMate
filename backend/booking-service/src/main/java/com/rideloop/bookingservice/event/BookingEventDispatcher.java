package com.rideloop.bookingservice.event;

import com.rideloop.commonevents.booking.BookingEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingEventDispatcher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public void dispatch(BookingEvent event) {
        applicationEventPublisher.publishEvent(event);
    }
}