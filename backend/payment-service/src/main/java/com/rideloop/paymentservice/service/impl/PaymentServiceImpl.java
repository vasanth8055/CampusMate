package com.rideloop.paymentservice.service.impl;
import com.rideloop.commonevents.payment.PaymentEvent;
import com.rideloop.commonevents.payment.PaymentEventType;
import com.rideloop.paymentservice.event.PaymentEventPublisher;
import java.time.LocalDateTime;
import com.rideloop.paymentservice.client.BookingClient;
import com.rideloop.paymentservice.client.TripClient;
import com.rideloop.paymentservice.dto.client.BookingInfoResponse;
import com.rideloop.paymentservice.dto.client.TripInfoResponse;
import com.rideloop.paymentservice.dto.request.CreatePaymentRequest;
import com.rideloop.paymentservice.dto.response.PaymentResponse;
import com.rideloop.paymentservice.entity.Payment;
import com.rideloop.paymentservice.entity.enums.PaymentProvider;
import com.rideloop.paymentservice.entity.enums.PaymentStatus;
import com.rideloop.paymentservice.repository.PaymentRepository;
import com.rideloop.paymentservice.service.interfaces.PaymentService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingClient bookingClient;
    private final TripClient tripClient;
    private final PaymentEventPublisher paymentEventPublisher;
    @Override
    @Transactional
    public PaymentResponse createPayment(
            UUID riderId,
            CreatePaymentRequest request) {

        if (paymentRepository.existsByBookingId(
                request.bookingId())) {

            throw new IllegalStateException(
                    "Payment already exists for this booking"
            );
        }

        ApiResponse<BookingInfoResponse> bookingApiResponse =
                bookingClient.getBooking(
                        request.bookingId()
                );

        BookingInfoResponse booking =
                bookingApiResponse.getData();

        if (booking == null) {
            throw new IllegalStateException(
                    "Booking information could not be fetched"
            );
        }

        if (!riderId.equals(booking.riderId())) {
            throw new AccessDeniedException(
                    "You cannot create payment for this booking"
            );
        }

        if (!"CONFIRMED".equalsIgnoreCase(
                booking.status())) {

            throw new IllegalStateException(
                    "Payment can only be created for a confirmed booking"
            );
        }

        ApiResponse<TripInfoResponse> tripApiResponse =
                tripClient.getTrip(
                        booking.tripId()
                );

        TripInfoResponse trip =
                tripApiResponse.getData();

        if (trip == null) {
            throw new IllegalStateException(
                    "Trip information could not be fetched"
            );
        }

        if (!booking.driverId().equals(
                trip.driverId())) {

            throw new IllegalStateException(
                    "Booking and trip driver do not match"
            );
        }

        if (trip.price() == null
                || trip.price().compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Trip price is invalid"
            );
        }

        BigDecimal amount =
                trip.price().multiply(
                        BigDecimal.valueOf(
                                booking.requestedSeats()
                        )
                );

        Payment payment =
                Payment.builder()
                        .bookingId(booking.id())
                        .riderId(booking.riderId())
                        .driverId(booking.driverId())
                        .amount(amount)
                        .currency("INR")
                        .status(PaymentStatus.PENDING)
                        .provider(PaymentProvider.MOCK)
                        .build();

        Payment savedPayment =
                paymentRepository.save(payment);

        paymentEventPublisher.publish(
                new PaymentEvent(
                        UUID.randomUUID(),
                        PaymentEventType.PAYMENT_CREATED,
                        savedPayment.getId(),
                        savedPayment.getBookingId(),
                        savedPayment.getRiderId(),
                        savedPayment.getDriverId(),
                        savedPayment.getAmount(),
                        savedPayment.getCurrency(),
                        LocalDateTime.now()
                )
        );

        return toResponse(savedPayment);

    }

    @Override
    public PaymentResponse getPayment(
            UUID paymentId,
            UUID riderId) {

        Payment payment =
                paymentRepository
                        .findByIdAndRiderId(
                                paymentId,
                                riderId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found"
                                )
                        );

        return toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getMyPayments(
            UUID riderId) {

        return paymentRepository
                .findByRiderIdOrderByCreatedAtDesc(
                        riderId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PaymentResponse toResponse(
            Payment payment) {

        return new PaymentResponse(
                payment.getId(),
                payment.getBookingId(),
                payment.getRiderId(),
                payment.getDriverId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getProvider(),
                payment.getProviderPaymentId(),
                payment.getFailureReason(),
                payment.getPaidAt(),
                payment.getFailedAt(),
                payment.getRefundedAt(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
    @Override
    @Transactional
    public PaymentResponse processPayment(
            UUID paymentId,
            UUID riderId) {

        Payment payment =
                paymentRepository
                        .findByIdAndRiderId(
                                paymentId,
                                riderId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found"
                                )
                        );

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending payments can be processed"
            );
        }

        // Simulate payment gateway processing.
        payment.setStatus(PaymentStatus.PROCESSING);

        /*
         * MOCK provider:
         * Later this section will call Razorpay.
         */
        payment.setProviderPaymentId(
                "mock_" + UUID.randomUUID()
        );

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(
                java.time.LocalDateTime.now()
        );

        payment.setFailureReason(null);

        Payment savedPayment =
                paymentRepository.saveAndFlush(payment);

        paymentEventPublisher.publish(
                new PaymentEvent(
                        UUID.randomUUID(),
                        PaymentEventType.PAYMENT_SUCCESS,
                        savedPayment.getId(),
                        savedPayment.getBookingId(),
                        savedPayment.getRiderId(),
                        savedPayment.getDriverId(),
                        savedPayment.getAmount(),
                        savedPayment.getCurrency(),
                        LocalDateTime.now()
                )
        );


        return toResponse(savedPayment);
    }
}