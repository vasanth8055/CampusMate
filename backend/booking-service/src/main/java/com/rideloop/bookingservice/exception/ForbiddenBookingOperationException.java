package com.rideloop.bookingservice.exception;

public class ForbiddenBookingOperationException
        extends RuntimeException {

    public ForbiddenBookingOperationException(String message) {
        super(message);
    }
}