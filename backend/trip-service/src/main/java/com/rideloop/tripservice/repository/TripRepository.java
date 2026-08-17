package com.rideloop.tripservice.repository;

import com.rideloop.tripservice.entity.Trip;
import com.rideloop.tripservice.enums.TripStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT t
            FROM Trip t
            WHERE t.id = :tripId
            """)
    Optional<Trip> findByIdForUpdate(
            @Param("tripId") UUID tripId
    );

    List<Trip> findByDriverId(UUID driverId);

    List<Trip> findByDriverIdOrderByDepartureTimeDesc(UUID driverId);

    List<Trip> findByDriverIdOrderByDepartureTimeDescCreatedAtDesc(UUID driverId);



    List<Trip> findByStatus(TripStatus status);

    List<Trip> findBySourceIgnoreCaseAndDestinationIgnoreCase(
            String source,
            String destination
    );

    List<Trip> findByDepartureTimeBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    List<Trip> findByDriverIdAndStatus(
            UUID driverId,
            TripStatus status
    );

    @Query("""
            SELECT t
            FROM Trip t
            WHERE (
                LOWER(TRIM(t.destination)) = LOWER(TRIM(:destination))
                OR LOWER(TRIM(t.destination)) LIKE LOWER(CONCAT('%', TRIM(:destination), '%'))
                OR LOWER(TRIM(:destination)) LIKE LOWER(CONCAT('%', TRIM(t.destination), '%'))
            )
              AND t.status = :status
              AND t.availableSeats >= :requiredSeats
              AND t.departureTime BETWEEN :from AND :to
            ORDER BY t.departureTime ASC
            """)
    List<Trip> searchAvailableTripsByDestination(
            @Param("destination") String destination,
            @Param("status") TripStatus status,
            @Param("requiredSeats") Integer requiredSeats,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
            SELECT t
            FROM Trip t
            WHERE (
                LOWER(TRIM(t.destination)) = LOWER(TRIM(:destination))
                OR LOWER(TRIM(t.destination)) LIKE LOWER(CONCAT('%', TRIM(:destination), '%'))
                OR LOWER(TRIM(:destination)) LIKE LOWER(CONCAT('%', TRIM(t.destination), '%'))
            )
              AND (
                :source IS NULL 
                OR TRIM(:source) = '' 
                OR LOWER(TRIM(t.source)) LIKE LOWER(CONCAT('%', TRIM(:source), '%'))
                OR LOWER(TRIM(:source)) LIKE LOWER(CONCAT('%', TRIM(t.source), '%'))
              )
              AND t.status = :status
              AND t.availableSeats >= :requiredSeats
              AND t.departureTime BETWEEN :from AND :to
            ORDER BY t.departureTime ASC
            """)
    List<Trip> searchAvailableTrips(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("status") TripStatus status,
            @Param("requiredSeats") Integer requiredSeats,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}