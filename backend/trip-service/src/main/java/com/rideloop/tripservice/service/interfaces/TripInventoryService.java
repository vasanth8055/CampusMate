package com.rideloop.tripservice.service.interfaces;

import com.rideloop.tripservice.dto.response.TripBookingInfoResponse;

import java.util.UUID;

public interface TripInventoryService {

    TripBookingInfoResponse getBookingInfo(UUID tripId);

    TripBookingInfoResponse reserveSeats(
            UUID tripId,
            UUID riderId,
            int seats
    );

    TripBookingInfoResponse releaseSeats(
            UUID tripId,
            int seats
    );
}