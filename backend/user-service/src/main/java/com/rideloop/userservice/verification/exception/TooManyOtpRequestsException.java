package com.rideloop.userservice.verification.exception;

public class TooManyOtpRequestsException extends RuntimeException {

    public TooManyOtpRequestsException(String message) {
        super(message);
    }
}