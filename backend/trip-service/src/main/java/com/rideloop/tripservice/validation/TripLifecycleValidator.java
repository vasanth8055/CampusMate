package com.rideloop.tripservice.validation;

import com.rideloop.tripservice.entity.Trip;
import com.rideloop.tripservice.enums.TripStatus;
import org.springframework.stereotype.Component;

@Component
public class TripLifecycleValidator {

    public void validateStart(Trip trip) {

        if (trip.getStatus() != TripStatus.SCHEDULED &&
                trip.getStatus() != TripStatus.FULL) {

            throw new IllegalStateException(
                    "Trip cannot be started."
            );
        }
    }

    public void validateComplete(Trip trip) {

        if (trip.getStatus() != TripStatus.IN_PROGRESS) {

            throw new IllegalStateException(
                    "Trip is not in progress."
            );
        }
    }

    public void validateCancel(Trip trip) {

        if (trip.getStatus() == TripStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Completed trips cannot be cancelled."
            );
        }
    }
}