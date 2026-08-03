package com.rideloop.bookingservice.entity;

import com.rideloop.bookingservice.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "bookings",
        indexes = {
                @Index(
                        name = "idx_booking_trip_id",
                        columnList = "trip_id"
                ),
                @Index(
                        name = "idx_booking_rider_id",
                        columnList = "rider_id"
                ),
                @Index(
                        name = "idx_booking_driver_id",
                        columnList = "driver_id"
                ),
                @Index(
                        name = "idx_booking_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "trip_id",
            nullable = false
    )
    private UUID tripId;

    @Column(
            name = "rider_id",
            nullable = false
    )
    private UUID riderId;

    @Column(
            name = "driver_id",
            nullable = false
    )
    private UUID driverId;

    @Column(
            name = "requested_seats",
            nullable = false
    )
    private Integer requestedSeats;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private BookingStatus status = BookingStatus.REQUESTED;

    @Column(
            name = "booking_time",
            nullable = false,
            updatable = false
    )
    private LocalDateTime bookingTime;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (bookingTime == null) {
            bookingTime = now;
        }

        if (status == null) {
            status = BookingStatus.REQUESTED;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}