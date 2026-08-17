package com.rideloop.adminservice.trip.service.interfaces;

import com.rideloop.adminservice.trip.dto.response.TripResponse;

import java.util.List;
import java.util.UUID;

public interface TripService {

    List<TripResponse> getAllTrips(String status, UUID driverId);

    List<TripResponse> getActiveTrips();

    TripResponse getTripDetails(UUID tripId);

    TripResponse cancelTrip(UUID tripId, UUID driverId);
}
