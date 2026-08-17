package com.rideloop.tripservice.service.interfaces;

import com.rideloop.tripservice.dto.request.CreateTripRequest;
import com.rideloop.tripservice.dto.request.UpdateTripRequest;
import com.rideloop.tripservice.dto.response.TripResponse;
import com.rideloop.tripservice.dto.response.TripTrackingInfoResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TripService {

    TripResponse createTrip(UUID driverId,
                            CreateTripRequest request);

    TripResponse getTripById(UUID tripId);

    List<TripResponse> getAllTrips();

    List<TripResponse> getDriverTrips(UUID driverId);

    TripResponse updateTrip(UUID tripId,
                            UUID driverId,
                            UpdateTripRequest request);

    void deleteTrip(UUID tripId,
                    UUID driverId);
    List<TripResponse> searchTrips(
            String source,
            String destination,
            LocalDateTime from,
            LocalDateTime to,
            Integer requiredSeats
    );

    List<TripResponse> searchTrips(
            String source,
            String destination,
            LocalDateTime from,
            LocalDateTime to,
            Integer requiredSeats,
            UUID excludeDriverId
    );

    TripTrackingInfoResponse getTrackingInfo(
            UUID tripId
    );
    TripResponse startTrip(
            UUID tripId,
            UUID driverId
    );

    TripResponse completeTrip(
            UUID tripId,
            UUID driverId
    );

    TripResponse cancelTrip(
            UUID tripId,
            UUID driverId
    );

}