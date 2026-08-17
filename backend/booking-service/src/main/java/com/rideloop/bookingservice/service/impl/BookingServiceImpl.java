package com.rideloop.bookingservice.service.impl;

import com.rideloop.bookingservice.client.TripBookingInfo;
import com.rideloop.bookingservice.client.TripClient;
import com.rideloop.bookingservice.dto.request.CreateBookingRequest;
import com.rideloop.bookingservice.dto.request.SeatReservationRequest;
import com.rideloop.bookingservice.dto.response.BookingResponse;
import com.rideloop.bookingservice.entity.Booking;
import com.rideloop.bookingservice.entity.enums.BookingStatus;
import com.rideloop.bookingservice.exception.BookingConflictException;
import com.rideloop.bookingservice.exception.BookingNotFoundException;
import com.rideloop.bookingservice.exception.ForbiddenBookingOperationException;
import com.rideloop.bookingservice.mapper.BookingMapper;
import com.rideloop.bookingservice.repository.BookingRepository;
import com.rideloop.bookingservice.service.interfaces.BookingService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rideloop.bookingservice.event.BookingEventDispatcher;
import com.rideloop.bookingservice.event.BookingEventFactory;
import com.rideloop.commonevents.booking.BookingEventType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    /*
     * These statuses represent bookings that are still active
     * for a rider on a particular trip.
     *
     * A rider cannot create another booking for the same trip
     * while one of these statuses exists.
     */
    private static final Set<BookingStatus> ACTIVE_STATUSES =
            Set.of(
                    BookingStatus.REQUESTED,
                    BookingStatus.ACCEPTED,
                    BookingStatus.PAYMENT_PENDING,
                    BookingStatus.CONFIRMED,
                    BookingStatus.ONGOING
            );

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final TripClient tripClient;
    private final BookingEventDispatcher bookingEventDispatcher;
    private final BookingEventFactory bookingEventFactory;
    // =========================================================
    // CREATE BOOKING
    // =========================================================

    @Override
    @Transactional
    public BookingResponse createBooking(
            UUID riderId,
            CreateBookingRequest request) {

        /*
         * Prevent duplicate active bookings by the same rider
         * for the same trip.
         */
        boolean alreadyExists =
                bookingRepository.existsByTripIdAndRiderIdAndStatusIn(
                        request.tripId(),
                        riderId,
                        ACTIVE_STATUSES
                );

        if (alreadyExists) {
            throw new BookingConflictException(
                    "You already have an active booking for this trip"
            );
        }

        /*
         * Ask Trip Service to reserve the requested seats.
         *
         * Trip Service is responsible for:
         * - validating the trip
         * - checking trip status
         * - checking departure time
         * - preventing driver from booking own trip
         * - checking seat availability
         * - atomically reducing available seats
         */
        ApiResponse<TripBookingInfo> tripResponse =
                tripClient.reserveSeats(
                        request.tripId(),
                        riderId,
                        new SeatReservationRequest(
                                request.requestedSeats()
                        )
                );

        TripBookingInfo trip = tripResponse.getData();

        if (trip == null) {
            throw new BookingConflictException(
                    "Unable to reserve seats for this trip"
            );
        }

        Booking booking = Booking.builder()
                .tripId(request.tripId())
                .riderId(riderId)
                .driverId(trip.driverId())
                .requestedSeats(request.requestedSeats())
                .status(BookingStatus.REQUESTED)
                .bookingTime(LocalDateTime.now())
                .build();

        try {

            /*
             * saveAndFlush() guarantees @PrePersist has executed
             * before we convert the entity into BookingResponse.
             */
            Booking saved =
                    bookingRepository.saveAndFlush(booking);

            dispatchEvent(
                    saved,
                    BookingEventType.BOOKING_REQUESTED
            );

            return bookingMapper.toResponse(saved);

        } catch (RuntimeException exception) {

            /*
             * Compensation:
             *
             * Trip Service has already reserved the seats.
             * If saving the booking fails, return those seats.
             *
             * Later this can evolve into a Saga / Kafka-based
             * distributed workflow.
             */
            try {

                tripClient.releaseSeats(
                        request.tripId(),
                        new SeatReservationRequest(
                                request.requestedSeats()
                        )
                );

            } catch (Exception ignored) {

                /*
                 * Do not replace the original database exception.
                 *
                 * Later we should log this and implement reliable
                 * compensation using events/outbox/Saga.
                 */
            }

            throw exception;
        }
    }

    // =========================================================
    // GET BOOKING
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(
            UUID bookingId,
            UUID authenticatedUserId) {

        Booking booking = findBooking(bookingId);

        /*
         * Only the rider or the trip driver should be able
         * to view this booking.
         */
        if (!booking.getRiderId().equals(authenticatedUserId)
                && !booking.getDriverId().equals(authenticatedUserId)) {

            throw new ForbiddenBookingOperationException(
                    "You are not allowed to access this booking"
            );
        }

        return bookingMapper.toResponse(booking);
    }

    // =========================================================
    // RIDER BOOKINGS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getRiderBookings(
            UUID riderId) {

        return bookingRepository
                .findAllByRiderIdOrderByCreatedAtDesc(riderId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    // =========================================================
    // DRIVER BOOKINGS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getDriverBookings(
            UUID driverId) {

        return bookingRepository
                .findAllByDriverIdOrderByCreatedAtDesc(driverId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    // =========================================================
    // TRIP BOOKINGS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getTripBookings(
            UUID tripId,
            UUID driverId) {

        /*
         * Verify through Trip Service that the authenticated user
         * actually owns the trip.
         */
        ApiResponse<TripBookingInfo> response =
                tripClient.getTrip(tripId);

        TripBookingInfo trip = response.getData();

        if (trip == null) {
            throw new BookingNotFoundException(
                    "Trip information could not be retrieved"
            );
        }

        if (!trip.driverId().equals(driverId)) {
            throw new ForbiddenBookingOperationException(
                    "Only the trip driver can view trip bookings"
            );
        }

        return bookingRepository
                .findAllByTripIdOrderByCreatedAtDesc(tripId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    // =========================================================
    // ACCEPT BOOKING
    // =========================================================

    @Override
    @Transactional
    public BookingResponse acceptBooking(
            UUID bookingId,
            UUID driverId) {

        Booking booking = findBooking(bookingId);

        verifyDriver(booking, driverId);

        requireStatus(
                booking,
                BookingStatus.REQUESTED,
                "Only requested bookings can be accepted"
        );

        booking.setStatus(BookingStatus.ACCEPTED);
        booking.setAcceptedAt(LocalDateTime.now());

        /*
         * Force Hibernate UPDATE now.
         *
         * This ensures Booking.@PreUpdate executes and therefore
         * updatedAt contains the new value before mapping.
         */
        Booking saved =
                bookingRepository.saveAndFlush(booking);
        dispatchEvent(
                saved,
                BookingEventType.BOOKING_ACCEPTED
        );

        return bookingMapper.toResponse(saved);


    }

    // =========================================================
    // REJECT BOOKING
    // =========================================================

    @Override
    @Transactional
    public BookingResponse rejectBooking(
            UUID bookingId,
            UUID driverId) {

        Booking booking = findBooking(bookingId);

        verifyDriver(booking, driverId);

        requireStatus(
                booking,
                BookingStatus.REQUESTED,
                "Only requested bookings can be rejected"
        );

        /*
         * Seats were reserved when the rider created the booking.
         *
         * Rejection means those seats must become available again.
         */
        tripClient.releaseSeats(
                booking.getTripId(),
                new SeatReservationRequest(
                        booking.getRequestedSeats()
                )
        );

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectedAt(LocalDateTime.now());
        Booking saved =
                bookingRepository.saveAndFlush(booking);

        dispatchEvent(
                saved,
                BookingEventType.BOOKING_REJECTED
        );

        return bookingMapper.toResponse(saved);
    }

    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    @Override
    @Transactional
    public BookingResponse cancelBooking(
            UUID bookingId,
            UUID riderId) {

        Booking booking = findBooking(bookingId);

        /*
         * Only the rider who owns the booking can cancel it.
         */
        if (!booking.getRiderId().equals(riderId)) {
            throw new ForbiddenBookingOperationException(
                    "Only the rider can cancel this booking"
            );
        }

        /*
         * Cancellation is allowed for active bookings except
         * an already-started ride.
         */
        if (!ACTIVE_STATUSES.contains(booking.getStatus())
                || booking.getStatus() == BookingStatus.ONGOING) {

            throw new BookingConflictException(
                    "This booking can no longer be cancelled"
            );
        }

        /*
         * Return the reserved seats to Trip Service.
         */
        tripClient.releaseSeats(
                booking.getTripId(),
                new SeatReservationRequest(
                        booking.getRequestedSeats()
                )
        );

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());

        Booking saved =
                bookingRepository.saveAndFlush(booking);

        dispatchEvent(
                saved,
                BookingEventType.BOOKING_CANCELLED
        );

        return bookingMapper.toResponse(saved);
    }

    // =========================================================
    // CONFIRM BOOKING
    // =========================================================

    @Override
    @Transactional
    public BookingResponse confirmBooking(
            UUID bookingId,
            UUID authenticatedUserId) {

        Booking booking = findBooking(bookingId);

        /*
         * Current RideLoop workflow allows either participant
         * associated with the booking to trigger confirmation.
         *
         * We can tighten this later when Payment Service owns
         * the ACCEPTED -> CONFIRMED transition.
         */
        if (!booking.getRiderId().equals(authenticatedUserId)
                && !booking.getDriverId().equals(authenticatedUserId)) {

            throw new ForbiddenBookingOperationException(
                    "You are not allowed to confirm this booking"
            );
        }

        requireStatus(
                booking,
                BookingStatus.ACCEPTED,
                "Only accepted bookings can be confirmed"
        );

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());

        Booking saved =
                bookingRepository.saveAndFlush(booking);

        dispatchEvent(
                saved,
                BookingEventType.BOOKING_CONFIRMED
        );

        return bookingMapper.toResponse(saved);
    }

    // =========================================================
    // START BOOKING / RIDE
    // =========================================================

    @Override
    @Transactional
    public BookingResponse startBooking(
            UUID bookingId,
            UUID driverId) {

        Booking booking = findBooking(bookingId);

        verifyDriver(booking, driverId);

        requireStatus(
                booking,
                BookingStatus.CONFIRMED,
                "Only confirmed bookings can be started"
        );

        booking.setStatus(BookingStatus.ONGOING);
        booking.setStartedAt(LocalDateTime.now());

        Booking saved =
                bookingRepository.saveAndFlush(booking);

        dispatchEvent(
                saved,
                BookingEventType.BOOKING_STARTED
        );

        return bookingMapper.toResponse(saved);
    }

    // =========================================================
    // COMPLETE BOOKING / RIDE
    // =========================================================

    @Override
    @Transactional
    public BookingResponse completeBooking(
            UUID bookingId,
            UUID driverId) {

        Booking booking = findBooking(bookingId);

        verifyDriver(booking, driverId);

        requireStatus(
                booking,
                BookingStatus.ONGOING,
                "Only ongoing bookings can be completed"
        );

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());

        Booking saved =
                bookingRepository.saveAndFlush(booking);

        dispatchEvent(
                saved,
                BookingEventType.BOOKING_COMPLETED
        );

        return bookingMapper.toResponse(saved);
    }

    // =========================================================
    // TRIP EVENT LIFECYCLE HANDLERS
    // =========================================================

    @Override
    @Transactional
    public void handleTripStarted(UUID tripId) {
        List<Booking> activeBookings = bookingRepository.findAllByTripIdAndStatusInOrderByCreatedAtDesc(
                tripId,
                List.of(BookingStatus.CONFIRMED, BookingStatus.ACCEPTED)
        );

        for (Booking booking : activeBookings) {
            booking.setStatus(BookingStatus.ONGOING);
            booking.setStartedAt(LocalDateTime.now());
            Booking saved = bookingRepository.saveAndFlush(booking);
            dispatchEvent(saved, BookingEventType.BOOKING_STARTED);
        }
    }

    @Override
    @Transactional
    public void handleTripCompleted(UUID tripId) {
        List<Booking> ongoingBookings = bookingRepository.findAllByTripIdAndStatusInOrderByCreatedAtDesc(
                tripId,
                List.of(BookingStatus.ONGOING, BookingStatus.CONFIRMED, BookingStatus.ACCEPTED)
        );

        for (Booking booking : ongoingBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            booking.setCompletedAt(LocalDateTime.now());
            Booking saved = bookingRepository.saveAndFlush(booking);
            dispatchEvent(saved, BookingEventType.BOOKING_COMPLETED);
        }
    }

    @Override
    @Transactional
    public void handleTripCancelled(UUID tripId, String reason) {
        List<Booking> activeBookings = bookingRepository.findAllByTripIdAndStatusInOrderByCreatedAtDesc(
                tripId,
                List.of(BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.CONFIRMED, BookingStatus.ONGOING)
        );

        for (Booking booking : activeBookings) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(LocalDateTime.now());
            Booking saved = bookingRepository.saveAndFlush(booking);
            dispatchEvent(saved, BookingEventType.BOOKING_CANCELLED);
        }
    }

    // =========================================================
    // PRIVATE HELPERS
    // =========================================================


    private Booking findBooking(UUID bookingId) {

        return bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new BookingNotFoundException(
                                "Booking not found: " + bookingId
                        )
                );
    }

    private void verifyDriver(
            Booking booking,
            UUID driverId) {

        if (!booking.getDriverId().equals(driverId)) {
            throw new ForbiddenBookingOperationException(
                    "Only the trip driver can perform this operation"
            );
        }
    }

    private void requireStatus(
            Booking booking,
            BookingStatus requiredStatus,
            String message) {

        if (booking.getStatus() != requiredStatus) {
            throw new BookingConflictException(message);
        }
    }
    private void dispatchEvent(
            Booking booking,
            BookingEventType eventType) {

        bookingEventDispatcher.dispatch(
                bookingEventFactory.create(
                        booking,
                        eventType
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookingsAdmin() {
        return bookingRepository.findAll()
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingAdmin(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));
        return bookingMapper.toResponse(booking);
    }
}