package com.rideloop.userservice.driver.vehicle.exception;

public class VehicleRegistrationAlreadyExistsException extends RuntimeException {

    public VehicleRegistrationAlreadyExistsException(String message) {
        super(message);
    }
}