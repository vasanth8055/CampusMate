package com.rideloop.paymentservice.repository;

import com.rideloop.paymentservice.entity.Payment;
import com.rideloop.paymentservice.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository
        extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByBookingId(
            UUID bookingId
    );

    boolean existsByBookingId(
            UUID bookingId
    );

    List<Payment> findByRiderIdOrderByCreatedAtDesc(
            UUID riderId
    );

    List<Payment> findByDriverIdOrderByCreatedAtDesc(
            UUID driverId
    );

    List<Payment> findByStatus(
            PaymentStatus status
    );

    Optional<Payment> findByIdAndRiderId(
            UUID paymentId,
            UUID riderId
    );
}