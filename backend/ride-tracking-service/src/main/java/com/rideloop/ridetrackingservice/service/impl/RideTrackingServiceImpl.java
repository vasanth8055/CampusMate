package com.rideloop.ridetrackingservice.service.impl;

import com.rideloop.ridetrackingservice.client.TripClient;
import com.rideloop.ridetrackingservice.dto.request.LocationUpdateRequest;
import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;
import com.rideloop.ridetrackingservice.entity.RideLocation;
import com.rideloop.ridetrackingservice.repository.RideLocationRepository;
import com.rideloop.ridetrackingservice.service.interfaces.LocationBroadcastService;
import com.rideloop.ridetrackingservice.service.interfaces.LocationCacheService;
import com.rideloop.ridetrackingservice.service.interfaces.RideTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RideTrackingServiceImpl
        implements RideTrackingService {

    private final RideLocationRepository repository;
    private final TripClient tripClient;
    private final LocationCacheService locationCacheService;
    private final LocationBroadcastService locationBroadcastService;
    @Override
    @Transactional
    public RideLocationResponse updateLocation(
            UUID driverId,
            UUID tripId,
            LocationUpdateRequest request) {

        RideLocation location =
                RideLocation.builder()
                        .tripId(tripId)
                        .driverId(driverId)
                        .latitude(request.latitude())
                        .longitude(request.longitude())
                        .speed(request.speed())
                        .heading(request.heading())
                        .accuracy(request.accuracy())
                        .recordedAt(LocalDateTime.now())
                        .build();

        return toResponse(
                repository.save(location)
        );
    }

    @Override
    public RideLocationResponse getLatestLocation(
            UUID tripId) {

        RideLocation location =
                repository
                        .findTopByTripIdOrderByRecordedAtDesc(
                                tripId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Location not found"
                                )
                        );

        return toResponse(location);
    }

    @Override
    public List<RideLocationResponse> getRideHistory(
            UUID tripId) {

        return repository
                .findByTripIdOrderByRecordedAtAsc(
                        tripId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RideLocationResponse toResponse(
            RideLocation location) {

        return new RideLocationResponse(
                location.getId(),
                location.getTripId(),
                location.getDriverId(),
                location.getLatitude(),
                location.getLongitude(),
                location.getSpeed(),
                location.getHeading(),
                location.getAccuracy(),
                location.getRecordedAt(),
                location.getCreatedAt()
        );
    }
}