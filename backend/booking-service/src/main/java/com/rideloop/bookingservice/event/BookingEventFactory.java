package com.rideloop.bookingservice.event;

import com.rideloop.bookingservice.entity.Booking;
import com.rideloop.commonevents.booking.BookingEvent;
import com.rideloop.commonevents.booking.BookingEventType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class BookingEventFactory {

    public BookingEvent create(
            Booking booking,
            BookingEventType eventType) {

        return new BookingEvent(
                UUID.randomUUID(),
                eventType,
                booking.getId(),
                booking.getTripId(),
                booking.getRiderId(),
                booking.getDriverId(),
                booking.getRequestedSeats(),
                LocalDateTime.now()
        );
    }
}