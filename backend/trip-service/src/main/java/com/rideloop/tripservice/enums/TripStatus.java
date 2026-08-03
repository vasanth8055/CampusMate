package com.rideloop.tripservice.enums;

public enum TripStatus {

    /**
     * Trip is created and visible for booking.
     */
    SCHEDULED,

    /**
     * All seats are booked.
     * Trip is still waiting to start.
     */
    FULL,

    /**
     * Driver has started the ride.
     */
    IN_PROGRESS,

    /**
     * Ride has finished successfully.
     */
    COMPLETED,

    /**
     * Trip cancelled by driver.
     */
    CANCELLED
}