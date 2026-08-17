package com.rideloop.userservice.driver.vehicle.entity;

import com.rideloop.userservice.driver.entity.DriverProfile;
import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleStatus;
import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "vehicles",
        indexes = {
                @Index(name = "idx_vehicle_driver", columnList = "driver_profile_id"),
                @Index(name = "idx_vehicle_registration", columnList = "registration_number")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "driver_profile_id",
            nullable = false
    )
    private DriverProfile driver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String color;

    @Column(
            name = "registration_number",
            nullable = false,
            unique = true
    )
    private String registrationNumber;

    @Column(name = "max_passenger_capacity", nullable = false)
    private Integer maxPassengerCapacity;

    @Column(name = "rc_image_url")
    private String rcImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = VehicleStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}