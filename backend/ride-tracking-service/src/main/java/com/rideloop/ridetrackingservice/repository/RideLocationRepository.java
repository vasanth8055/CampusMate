package com.rideloop.ridetrackingservice.repository;

import com.rideloop.ridetrackingservice.entity.RideLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RideLocationRepository
        extends JpaRepository<RideLocation, UUID> {

    Optional<RideLocation>
    findTopByTripIdOrderByRecordedAtDesc(
            UUID tripId
    );

    List<RideLocation>
    findByTripIdOrderByRecordedAtAsc(
            UUID tripId
    );
}