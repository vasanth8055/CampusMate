package com.rideloop.paymentservice.entity;

import com.rideloop.paymentservice.entity.enums.PaymentProvider;
import com.rideloop.paymentservice.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "payments",
        indexes = {
                @Index(
                        name = "idx_payment_booking_id",
                        columnList = "booking_id"
                ),
                @Index(
                        name = "idx_payment_rider_id",
                        columnList = "rider_id"
                ),
                @Index(
                        name = "idx_payment_driver_id",
                        columnList = "driver_id"
                ),
                @Index(
                        name = "idx_payment_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_payment_created_at",
                        columnList = "created_at"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payment_booking_id",
                        columnNames = "booking_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "booking_id",
            nullable = false,
            updatable = false
    )
    private UUID bookingId;

    @Column(
            name = "rider_id",
            nullable = false,
            updatable = false
    )
    private UUID riderId;

    @Column(
            name = "driver_id",
            nullable = false,
            updatable = false
    )
    private UUID driverId;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amount;

    @Column(
            nullable = false,
            length = 3
    )
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private PaymentProvider provider = PaymentProvider.MOCK;

    @Column(
            name = "provider_payment_id",
            length = 150
    )
    private String providerPaymentId;

    @Column(
            name = "failure_reason",
            length = 500
    )
    private String failureReason;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "failed_at")
    private LocalDateTime failedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

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

        if (status == null) {
            status = PaymentStatus.PENDING;
        }

        if (provider == null) {
            provider = PaymentProvider.MOCK;
        }

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}