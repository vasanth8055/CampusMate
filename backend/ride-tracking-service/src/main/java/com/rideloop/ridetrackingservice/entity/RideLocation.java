package com.rideloop.ridetrackingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "ride_locations",
        indexes = {
                @Index(
                        name = "idx_tracking_trip",
                        columnList = "trip_id"
                ),
                @Index(
                        name = "idx_tracking_driver",
                        columnList = "driver_id"
                ),
                @Index(
                        name = "idx_tracking_recorded_at",
                        columnList = "recorded_at"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column
    private Double speed;

    @Column
    private Double heading;

    @Column
    private Double accuracy;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (recordedAt == null) {
            recordedAt = now;
        }

        createdAt = now;
    }
}