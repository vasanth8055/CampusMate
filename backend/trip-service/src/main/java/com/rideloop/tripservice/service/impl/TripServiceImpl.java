package com.rideloop.tripservice.service.impl;

import com.rideloop.commonevents.trip.TripCancelledEvent;
import com.rideloop.commonevents.trip.TripCompletedEvent;
import com.rideloop.commonevents.trip.TripStartedEvent;
import com.rideloop.tripservice.client.UserServiceClient;
import com.rideloop.tripservice.dto.request.CreateTripRequest;
import com.rideloop.tripservice.dto.request.UpdateTripRequest;
import com.rideloop.tripservice.dto.response.DriverInfoResponse;
import com.rideloop.tripservice.dto.response.TripResponse;
import com.rideloop.tripservice.dto.response.TripTrackingInfoResponse;
import com.rideloop.tripservice.dto.response.VehicleResponse;
import com.rideloop.tripservice.entity.Trip;
import com.rideloop.tripservice.enums.TripStatus;
import com.rideloop.tripservice.enums.VehicleStatus;
import com.rideloop.tripservice.exception.ForbiddenOperationException;
import com.rideloop.tripservice.exception.TripNotFoundException;
import com.rideloop.tripservice.kafka.producer.TripEventProducer;
import com.rideloop.tripservice.mapper.TripMapper;
import com.rideloop.tripservice.repository.TripRepository;
import com.rideloop.tripservice.service.interfaces.TripService;
import com.rideloop.tripservice.validation.TripLifecycleValidator;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final TripMapper tripMapper;
    private final TripLifecycleValidator tripLifecycleValidator;
    private final TripEventProducer tripEventProducer;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    public TripResponse createTrip(
            UUID driverId,
            CreateTripRequest request) {

        log.info("========== CREATE TRIP START ==========");
        log.info("Driver ID: {}", driverId);
        log.info("Source: {}", request.source());
        log.info("Destination: {}", request.destination());
        log.info("Departure: {}", request.departureTime());
        log.info("Arrival: {}", request.arrivalTime());
        log.info("Available seats: {}", request.availableSeats());
        log.info("Price: {}", request.price());

        try {

            // -------------------------------------------------
            // 1. Check driver approval
            // -------------------------------------------------

            log.info("Checking driver approval...");

            var approvalResponse =
                    userServiceClient.isDriverApproved(driverId);

            log.info("Driver approval response: {}", approvalResponse);

            if (approvalResponse == null) {
                throw new IllegalStateException(
                        "User service returned null approval response."
                );
            }

            Boolean approved = approvalResponse.getData();

            log.info("Driver approved: {}", approved);

            if (!Boolean.TRUE.equals(approved)) {
                throw new IllegalStateException(
                        "Driver is not approved."
                );
            }

            // -------------------------------------------------
            // 2. Get driver's vehicle
            // -------------------------------------------------

            log.info("Fetching driver's vehicle...");

            var vehicleResponse =
                    userServiceClient.getVehicleByDriver(driverId);

            log.info("Vehicle response: {}", vehicleResponse);

            if (vehicleResponse == null) {
                throw new IllegalStateException(
                        "User service returned null vehicle response."
                );
            }

            VehicleResponse vehicle =
                    vehicleResponse.getData();

            log.info("Vehicle: {}", vehicle);

            if (vehicle == null) {
                throw new IllegalStateException(
                        "Please register a vehicle before creating a trip."
                );
            }

            log.info("Vehicle status: {}", vehicle.status());
            log.info(
                    "Vehicle maximum passenger capacity: {}",
                    vehicle.maxPassengerCapacity()
            );

            if (vehicle.status() != VehicleStatus.ACTIVE) {
                throw new IllegalStateException(
                        "Your vehicle is not active."
                );
            }

            // -------------------------------------------------
            // 3. Validate seats
            // -------------------------------------------------

            if (request.availableSeats()
                    > vehicle.maxPassengerCapacity()) {

                throw new IllegalArgumentException(
                        "Available seats cannot exceed vehicle capacity of "
                                + vehicle.maxPassengerCapacity()
                                + "."
                );
            }

            // -------------------------------------------------
            // 4. Create entity
            // -------------------------------------------------

            log.info("Mapping request to Trip entity...");

            Trip trip = tripMapper.toEntity(request);

            trip.setDriverId(driverId);
            trip.setStatus(TripStatus.SCHEDULED);

            log.info("Saving trip to database...");

            Trip savedTrip =
                    tripRepository.save(trip);

            log.info("Trip saved successfully. ID: {}",
                    savedTrip.getId());

            // -------------------------------------------------
            // 5. Fetch driver information
            // -------------------------------------------------

            log.info("Fetching driver information...");

            var driverResponse =
                    userServiceClient.getDriver(driverId);

            log.info("Driver response: {}", driverResponse);

            DriverInfoResponse driver = null;

            if (driverResponse != null) {
                driver = driverResponse.getData();
            }

            // -------------------------------------------------
            // 6. Build response
            // -------------------------------------------------

            TripResponse baseResponse =
                    tripMapper.toResponse(savedTrip);

            TripResponse response =
                    new TripResponse(
                            baseResponse.id(),
                            baseResponse.driverId(),
                            baseResponse.source(),
                            baseResponse.sourceLatitude(),
                            baseResponse.sourceLongitude(),
                            baseResponse.destination(),
                            baseResponse.destinationLatitude(),
                            baseResponse.destinationLongitude(),
                            baseResponse.departureTime(),
                            baseResponse.arrivalTime(),
                            baseResponse.availableSeats(),
                            baseResponse.price(),
                            baseResponse.status(),
                            baseResponse.createdAt(),
                            baseResponse.updatedAt(),
                            driver,
                            vehicle
                    );

            log.info("Trip response created successfully.");
            log.info("========== CREATE TRIP SUCCESS ==========");

            return response;

        } catch (FeignException e) {

            log.error(
                    "USER SERVICE FEIGN ERROR while creating trip. " +
                            "Driver ID: {}, Status: {}, Message: {}",
                    driverId,
                    e.status(),
                    e.getMessage(),
                    e
            );

            if (e.status() == 404) {
                throw new IllegalStateException(
                        "Driver profile or registered vehicle not found. Please ensure you have an approved driver profile and active vehicle."
                );
            }

            throw new IllegalStateException(
                    "Unable to communicate with User Service."
            );


        } catch (Exception e) {

            log.error(
                    "CREATE TRIP FAILED. Driver ID: {}, Error: {}",
                    driverId,
                    e.getMessage(),
                    e
            );

            throw e;
        }
    }

    @Override
    public TripResponse getTripById(UUID tripId) {

        return enrichTripResponse(
                getTripEntityById(tripId)
        );
    }

    @Override
    public List<TripResponse> getAllTrips() {

        return tripRepository.findAll()
                .stream()
                .map(this::enrichTripResponse)
                .toList();
    }

    @Override
    public List<TripResponse> getDriverTrips(UUID driverId) {

        return tripRepository.findByDriverIdOrderByDepartureTimeDescCreatedAtDesc(driverId)
                .stream()
                .map(this::enrichTripResponse)
                .toList();
    }



    @Override
    public TripResponse updateTrip(
            UUID tripId,
            UUID driverId,
            UpdateTripRequest request) {

        Trip trip = getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripMapper.updateTrip(request, trip);

        Trip updatedTrip =
                tripRepository.save(trip);

        return enrichTripResponse(updatedTrip);
    }

    @Override
    public void deleteTrip(
            UUID tripId,
            UUID driverId) {

        Trip trip =
                getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        if (trip.getStatus() == TripStatus.IN_PROGRESS) {
            throw new IllegalStateException("An active in-progress trip cannot be deleted.");
        }
        if (trip.getStatus() == TripStatus.COMPLETED) {
            throw new IllegalStateException("Completed trips cannot be deleted as they are part of historical records.");
        }

        tripRepository.delete(trip);
    }

    private Trip getTripEntityById(UUID tripId) {

        return tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new TripNotFoundException(
                                "Trip not found with id: " + tripId
                        )
                );
    }

    private void validateTripOwner(
            Trip trip,
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
        return searchTrips(source, destination, from, to, requiredSeats, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> searchTrips(
            String source,
            String destination,
            LocalDateTime from,
            LocalDateTime to,
            Integer requiredSeats,
            UUID excludeDriverId) {

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

        List<Trip> trips;
        if (source != null && !source.isBlank()) {
            trips = tripRepository.searchAvailableTrips(
                    source.trim(),
                    destination.trim(),
                    TripStatus.SCHEDULED,
                    requiredSeats,
                    from,
                    to
            );
            if (trips.isEmpty()) {
                trips = tripRepository.searchAvailableTripsByDestination(
                        destination.trim(),
                        TripStatus.SCHEDULED,
                        requiredSeats,
                        from,
                        to
                );
            }
        } else {
            trips = tripRepository.searchAvailableTripsByDestination(
                    destination.trim(),
                    TripStatus.SCHEDULED,
                    requiredSeats,
                    from,
                    to
            );
        }


        return trips.stream()
                .filter(trip -> excludeDriverId == null || !trip.getDriverId().equals(excludeDriverId))
                .map(this::enrichTripResponse)
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

        Trip trip =
                getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripLifecycleValidator.validateStart(trip);

        trip.setStatus(TripStatus.IN_PROGRESS);

        Trip savedTrip =
                tripRepository.save(trip);

        tripEventProducer.publishTripStarted(
                new TripStartedEvent(
                        savedTrip.getId(),
                        savedTrip.getDriverId(),
                        LocalDateTime.now()
                )
        );

        return enrichTripResponse(savedTrip);
    }

    @Override
    @Transactional
    public TripResponse completeTrip(
            UUID tripId,
            UUID driverId) {

        Trip trip =
                getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripLifecycleValidator.validateComplete(trip);

        trip.setStatus(TripStatus.COMPLETED);

        Trip savedTrip =
                tripRepository.save(trip);

        tripEventProducer.publishTripCompleted(
                new TripCompletedEvent(
                        savedTrip.getId(),
                        savedTrip.getDriverId(),
                        LocalDateTime.now()
                )
        );

        return enrichTripResponse(savedTrip);
    }

    @Override
    @Transactional
    public TripResponse cancelTrip(
            UUID tripId,
            UUID driverId) {

        Trip trip =
                getTripEntityById(tripId);

        validateTripOwner(trip, driverId);

        tripLifecycleValidator.validateCancel(trip);

        trip.setStatus(TripStatus.CANCELLED);

        Trip savedTrip =
                tripRepository.save(trip);

        tripEventProducer.publishTripCancelled(
                new TripCancelledEvent(
                        savedTrip.getId(),
                        savedTrip.getDriverId(),
                        "Cancelled by driver",
                        LocalDateTime.now()
                )
        );

        return enrichTripResponse(savedTrip);
    }

    private TripResponse enrichTripResponse(
            Trip trip) {

        TripResponse baseResponse =
                tripMapper.toResponse(trip);

        DriverInfoResponse driver = null;
        try {
            var driverRes = userServiceClient.getDriver(trip.getDriverId());
            if (driverRes != null) {
                driver = driverRes.getData();
            }
        } catch (Exception e) {
            log.warn("Could not enrich driver info for driver {}: {}", trip.getDriverId(), e.getMessage());
        }

        VehicleResponse vehicle = null;
        try {
            var vehicleRes = userServiceClient.getVehicleByDriver(trip.getDriverId());
            if (vehicleRes != null) {
                vehicle = vehicleRes.getData();
            }
        } catch (Exception e) {
            log.warn("Could not enrich vehicle info for driver {}: {}", trip.getDriverId(), e.getMessage());
        }

        return new TripResponse(
                baseResponse.id(),
                baseResponse.driverId(),
                baseResponse.source(),
                baseResponse.sourceLatitude(),
                baseResponse.sourceLongitude(),
                baseResponse.destination(),
                baseResponse.destinationLatitude(),
                baseResponse.destinationLongitude(),
                baseResponse.departureTime(),
                baseResponse.arrivalTime(),
                baseResponse.availableSeats(),
                baseResponse.price(),
                baseResponse.status(),
                baseResponse.createdAt(),
                baseResponse.updatedAt(),
                driver,
                vehicle
        );
    }
}