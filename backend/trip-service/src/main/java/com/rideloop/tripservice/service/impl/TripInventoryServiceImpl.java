package com.rideloop.tripservice.service.impl;

import com.rideloop.tripservice.client.UserServiceClient;
import com.rideloop.tripservice.dto.response.TripBookingInfoResponse;
import com.rideloop.tripservice.entity.Trip;
import com.rideloop.tripservice.enums.TripStatus;
import com.rideloop.tripservice.exception.TripNotFoundException;
import com.rideloop.tripservice.repository.TripRepository;
import com.rideloop.tripservice.service.interfaces.TripInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripInventoryServiceImpl
        implements TripInventoryService {

    private final TripRepository tripRepository;

    @Override
    @Transactional(readOnly = true)
    public TripBookingInfoResponse getBookingInfo(UUID tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new TripNotFoundException(
                                "Trip not found: " + tripId
                        )
                );

        return toResponse(trip);
    }

    @Override
    @Transactional
    public TripBookingInfoResponse reserveSeats(
            UUID tripId,
            UUID riderId,
            int seats) {

        Trip trip = tripRepository.findByIdForUpdate(tripId)
                .orElseThrow(() ->
                        new TripNotFoundException(
                                "Trip not found: " + tripId
                        )
                );

        if (trip.getDriverId().equals(riderId)) {
            throw new IllegalStateException(
                    "Driver cannot book their own trip"
            );
        }

        if (trip.getStatus() != TripStatus.SCHEDULED) {
            throw new IllegalStateException(
                    "Seats can only be reserved on scheduled trips"
            );
        }

        if (!trip.getDepartureTime().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException(
                    "Cannot book a trip that has already departed"
            );
        }

        if (seats <= 0) {
            throw new IllegalArgumentException(
                    "Seat count must be greater than zero"
            );
        }

        if (trip.getAvailableSeats() < seats) {
            throw new IllegalStateException(
                    "Not enough seats available"
            );
        }

        trip.setAvailableSeats(
                trip.getAvailableSeats() - seats
        );

        Trip saved = tripRepository.save(trip);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public TripBookingInfoResponse releaseSeats(
            UUID tripId,
            int seats) {

        Trip trip = tripRepository.findByIdForUpdate(tripId)
                .orElseThrow(() ->
                        new TripNotFoundException(
                                "Trip not found: " + tripId
                        )
                );

        if (seats <= 0) {
            throw new IllegalArgumentException(
                    "Seat count must be greater than zero"
            );
        }

        trip.setAvailableSeats(
                trip.getAvailableSeats() + seats
        );

        Trip saved = tripRepository.save(trip);

        return toResponse(saved);
    }

    private TripBookingInfoResponse toResponse(Trip trip) {

        return new TripBookingInfoResponse(
                trip.getId(),
                trip.getDriverId(),
                trip.getAvailableSeats(),
                trip.getPrice(),
                trip.getStatus(),
                trip.getDepartureTime()
        );
    }
}