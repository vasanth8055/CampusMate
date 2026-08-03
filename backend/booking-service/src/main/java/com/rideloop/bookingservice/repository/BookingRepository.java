package com.rideloop.bookingservice.repository;

import com.rideloop.bookingservice.entity.Booking;
import com.rideloop.bookingservice.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository
        extends JpaRepository<Booking, UUID> {

    List<Booking> findAllByRiderIdOrderByCreatedAtDesc(
            UUID riderId
    );

    List<Booking> findAllByDriverIdOrderByCreatedAtDesc(
            UUID driverId
    );

    List<Booking> findAllByTripIdOrderByCreatedAtDesc(
            UUID tripId
    );

    List<Booking> findAllByTripIdAndStatusInOrderByCreatedAtDesc(
            UUID tripId,
            Collection<BookingStatus> statuses
    );

    Optional<Booking> findByIdAndRiderId(
            UUID bookingId,
            UUID riderId
    );

    Optional<Booking> findByIdAndDriverId(
            UUID bookingId,
            UUID driverId
    );

    boolean existsByTripIdAndRiderIdAndStatusIn(
            UUID tripId,
            UUID riderId,
            Collection<BookingStatus> statuses
    );
}