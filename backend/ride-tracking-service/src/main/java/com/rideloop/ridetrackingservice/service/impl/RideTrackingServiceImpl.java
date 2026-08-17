package com.rideloop.ridetrackingservice.service.impl;

import com.rideloop.ridetrackingservice.client.TripClient;
import com.rideloop.ridetrackingservice.dto.request.LocationUpdateRequest;
import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;
import com.rideloop.ridetrackingservice.entity.RideLocation;
import com.rideloop.ridetrackingservice.repository.RideLocationRepository;
import com.rideloop.ridetrackingservice.service.interfaces.LocationBroadcastService;
import com.rideloop.ridetrackingservice.service.interfaces.LocationCacheService;
import com.rideloop.ridetrackingservice.service.interfaces.RideTrackingService;
import com.rideloop.ridetrackingservice.dto.client.TripTrackingInfoResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
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

        // 1. Authorize: Verify that authenticated driver is the owner of this trip
        try {
            ApiResponse<TripTrackingInfoResponse> tripRes = tripClient.getTrackingInfo(tripId);
            TripTrackingInfoResponse trip = tripRes != null ? tripRes.getData() : null;
            if (trip == null) {
                throw new IllegalArgumentException("Trip not found: " + tripId);
            }
            if (trip.driverId() != null && !trip.driverId().equals(driverId)) {
                throw new AccessDeniedException("Only the driver of this trip can submit location updates");
            }
        } catch (AccessDeniedException ade) {
            throw ade;
        } catch (Exception e) {
            log.warn("Tracking authorization verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Trip not found or invalid: " + tripId);
        }

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

        RideLocation saved = repository.save(location);
        RideLocationResponse response = toResponse(saved);

        // 2. Cache latest live location in Redis
        try {
            locationCacheService.saveLatestLocation(response);
        } catch (Exception e) {
            // Redis error must not break tracking flow
            log.warn("Redis caching error in tracking: {}", e.getMessage());
        }

        // 3. Broadcast real-time location via WebSocket STOMP
        try {
            locationBroadcastService.broadcastLocation(response);
        } catch (Exception e) {
            // WebSocket broadcast error fallback to polling
            log.warn("WebSocket broadcast error in tracking: {}", e.getMessage());
        }

        return response;
    }

    @Override
    public RideLocationResponse getLatestLocation(
            UUID tripId) {

        // 1. Try Redis cache first
        try {
            RideLocationResponse cached = locationCacheService.getLatestLocation(tripId);
            if (cached != null) {
                return cached;
            }
        } catch (Exception e) {
            // fallback to database query
        }

        // 2. Fallback to durable Postgres database
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

        RideLocationResponse response = toResponse(location);

        // Populate cache for subsequent queries
        try {
            locationCacheService.saveLatestLocation(response);
        } catch (Exception ignored) {
        }

        return response;
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