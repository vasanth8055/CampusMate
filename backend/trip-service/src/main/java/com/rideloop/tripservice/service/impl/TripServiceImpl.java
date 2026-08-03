package com.rideloop.tripservice.service.impl;

import com.rideloop.commonevents.trip.TripCancelledEvent;
import com.rideloop.commonevents.trip.TripCompletedEvent;
import com.rideloop.commonevents.trip.TripStartedEvent;
import com.rideloop.tripservice.client.UserServiceClient;
import com.rideloop.tripservice.dto.request.CreateTripRequest;
import com.rideloop.tripservice.dto.request.UpdateTripRequest;
import com.rideloop.tripservice.dto.response.TripResponse;
import com.rideloop.tripservice.dto.response.TripTrackingInfoResponse;
import com.rideloop.tripservice.entity.Trip;
import com.rideloop.tripservice.enums.TripStatus;
import com.rideloop.tripservice.exception.ForbiddenOperationException;
import com.rideloop.tripservice.exception.TripNotFoundException;
import com.rideloop.tripservice.kafka.producer.TripEventProducer;
import com.rideloop.tripservice.mapper.TripMapper;
import com.rideloop.tripservice.repository.TripRepository;
import com.rideloop.tripservice.service.interfaces.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import com.rideloop.tripservice.validation.TripLifecycleValidator;
@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final TripMapper tripMapper;
    private final TripLifecycleValidator tripLifecycleValidator;
    private final TripEventProducer tripEventProducer;
    private final UserServiceClient userServiceClient;
    @Override
    public TripResponse createTrip(
            UUID driverId,
            CreateTripRequest request) {

        boolean approved =
                userServiceClient
                        .isDriverApproved(driverId)
                        .getData();

        if (!approved) {
            throw new IllegalStateException(
                    "Driver is not approved."
            );
        }

        Trip trip = tripMapper.toEntity(request);

        trip.setDriverId(driverId);
        trip.setStatus(TripStatus.SCHEDULED);

        Trip savedTrip = tripRepository.save(trip);

        return tripMapper.toResponse(savedTrip);
    }

    @Override
    public TripResponse getTripById(UUID tripId) {

        return tripMapper.toResponse(getTripEntityById(tripId));
    }

    @Override
    public List<TripResponse> getAllTrips() {

        return tripRepository.findAll()
                .stream()
                .map(tripMapper::toResponse)
                .toList();
    }

    @Override
    public List<TripResponse> getDriverTrips(UUID driverId) {

        return tripRepository.findByDriverId(driverId)
                .stream()
                .map(tripMapper::toResponse)
                .toList();
    }

    @Override
    public TripResponse updateTrip(UUID tripId,
                                   UUID driverId,
                                   UpdateTripRequest request) {

        Trip trip = getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripMapper.updateTrip(request, trip);

        Trip updatedTrip = tripRepository.save(trip);

        return tripMapper.toResponse(updatedTrip);
    }

    @Override
    public void deleteTrip(UUID tripId,
                           UUID driverId) {

        Trip trip = getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripRepository.delete(trip);
    }

    /**
     * Fetches a trip or throws TripNotFoundException.
     */
    private Trip getTripEntityById(UUID tripId) {

        return tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new TripNotFoundException(
                                "Trip not found with id: " + tripId));
    }

    /**
     * Ensures that only the owner(driver) can modify the trip.
     */
    private void validateTripOwner(Trip trip,
                                   UUID driverId) {

        if (!trip.getDriverId().equals(driverId)) {
            throw new ForbiddenOperationException(
                    "You are not authorized to perform this operation on this trip."
            );
        }
    }
    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> searchTrips(
            String source,
            String destination,
            LocalDateTime from,
            LocalDateTime to,
            Integer requiredSeats) {

        if (source == null || source.isBlank()) {
            throw new IllegalArgumentException(
                    "Source is required"
            );
        }

        if (destination == null || destination.isBlank()) {
            throw new IllegalArgumentException(
                    "Destination is required"
            );
        }

        if (from == null || to == null) {
            throw new IllegalArgumentException(
                    "Departure time range is required"
            );
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "'from' time cannot be after 'to' time"
            );
        }

        if (requiredSeats == null || requiredSeats < 1) {
            throw new IllegalArgumentException(
                    "Required seats must be at least 1"
            );
        }

        return tripRepository
                .searchAvailableTrips(
                        source.trim(),
                        destination.trim(),
                        TripStatus.SCHEDULED,
                        requiredSeats,
                        from,
                        to
                )
                .stream()
                .map(tripMapper::toResponse)
                .toList();
    }
    @Override
    public TripTrackingInfoResponse getTrackingInfo(
            UUID tripId) {

        Trip trip =
                tripRepository.findById(tripId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Trip not found"
                                )
                        );

        return new TripTrackingInfoResponse(
                trip.getId(),
                trip.getDriverId(),
                trip.getStatus().name()
        );
    }
    @Override
    @Transactional
    public TripResponse startTrip(
            UUID tripId,
            UUID driverId) {

        Trip trip = getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripLifecycleValidator.validateStart(trip);

        trip.setStatus(TripStatus.IN_PROGRESS);

        Trip savedTrip = tripRepository.save(trip);

        // TODO Publish TripStartedEvent
        tripEventProducer.publishTripStarted(

                new TripStartedEvent(

                        savedTrip.getId(),

                        savedTrip.getDriverId(),

                        LocalDateTime.now()

                )
        );

        return tripMapper.toResponse(savedTrip);
    }
    @Override
    @Transactional
    public TripResponse completeTrip(
            UUID tripId,
            UUID driverId) {

        Trip trip = getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripLifecycleValidator.validateComplete(trip);

        trip.setStatus(TripStatus.COMPLETED);

        Trip savedTrip = tripRepository.save(trip);

        // TODO Publish TripCompletedEvent
        tripEventProducer.publishTripCompleted(

                new TripCompletedEvent(

                        savedTrip.getId(),

                        savedTrip.getDriverId(),

                        LocalDateTime.now()

                )
        );

        return tripMapper.toResponse(savedTrip);
    }
    @Override
    @Transactional
    public TripResponse cancelTrip(
            UUID tripId,
            UUID driverId) {

        Trip trip = getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripLifecycleValidator.validateCancel(trip);

        trip.setStatus(TripStatus.CANCELLED);

        Trip savedTrip = tripRepository.save(trip);

        // TODO Publish TripCancelledEvent
        tripEventProducer.publishTripCancelled(

                new TripCancelledEvent(

                        savedTrip.getId(),

                        savedTrip.getDriverId(),

                        "Cancelled by driver",

                        LocalDateTime.now()

                )
        );

        return tripMapper.toResponse(savedTrip);
    }
}