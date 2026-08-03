package com.rideloop.userservice.college.exception;

public class CollegeNotSupportedException
        extends RuntimeException {

    public CollegeNotSupportedException(
            String message) {
        super(message);
    }
}