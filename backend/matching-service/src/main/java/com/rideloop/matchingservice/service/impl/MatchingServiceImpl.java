package com.rideloop.matchingservice.service.impl;

import com.rideloop.matchingservice.client.TripClient;
import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.dto.response.MatchResponse;
import com.rideloop.matchingservice.engine.MatchScoringEngine;
import com.rideloop.matchingservice.engine.model.MatchScore;
import com.rideloop.matchingservice.engine.strategy.RouteScoreStrategy;
import com.rideloop.matchingservice.service.interfaces.MatchingService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingServiceImpl implements MatchingService {

    private final TripClient tripClient;
    private final MatchScoringEngine matchScoringEngine;
    private final RouteScoreStrategy routeScoreStrategy;

    @Override
    public List<MatchResponse> findMatches(
            MatchRequest request) {
        return findMatches(request, null);
    }

    @Override
    public List<MatchResponse> findMatches(
            MatchRequest request,
            java.util.UUID excludeDriverId) {

        log.info("========== MATCHING SEARCH START ==========");
        log.info("Rider Source: {} ({}, {})", request.source(), request.sourceLatitude(), request.sourceLongitude());
        log.info("Rider Destination: {} ({}, {})", request.destination(), request.destinationLatitude(), request.destinationLongitude());
        log.info("Preferred Departure: {}, Tolerance: {} mins, Required Seats: {}, ExcludeDriver: {}",
                request.preferredDepartureTime(), request.timeToleranceMinutes(), request.requiredSeats(), excludeDriverId);

        LocalDateTime from =
                request.preferredDepartureTime()
                        .minusMinutes(
                                request.timeToleranceMinutes()
                        );

        LocalDateTime to =
                request.preferredDepartureTime()
                        .plusMinutes(
                                request.timeToleranceMinutes()
                        );

        ApiResponse<List<TripResponse>> response =
                tripClient.searchAvailableTrips(
                        null,
                        request.destination().trim(),
                        from,
                        to,
                        request.requiredSeats()
                );

        List<TripResponse> trips = response != null ? response.getData() : null;

        if (trips == null || trips.isEmpty()) {
            log.info("No candidate trips returned from Trip Service for destination: {}", request.destination());
            return List.of();
        }

        log.info("Fetched {} candidate trips from Trip Service. Filtering for geographic and score compatibility...", trips.size());

        List<MatchResponse> matches = trips.stream()
                .filter(trip -> "SCHEDULED".equalsIgnoreCase(trip.status()))
                .filter(trip -> trip.availableSeats() != null && trip.availableSeats() >= request.requiredSeats())
                .filter(trip -> excludeDriverId == null || !excludeDriverId.toString().equalsIgnoreCase(trip.driverId().toString()))
                .filter(trip -> {
                    long diff = Math.abs(Duration.between(request.preferredDepartureTime(), trip.departureTime()).toMinutes());
                    return diff <= request.timeToleranceMinutes();
                })
                .filter(trip -> {
                    boolean compatible = routeScoreStrategy.isGeographicallyCompatible(trip, request);
                    if (!compatible) {
                        log.debug("Trip {} filtered out due to pickup incompatibility", trip.id());
                    }
                    return compatible;
                })

                .map(trip -> {
                    long differenceMinutes =
                            Math.abs(
                                    Duration.between(
                                            request.preferredDepartureTime(),
                                            trip.departureTime()
                                    ).toMinutes()
                            );

                    MatchScore score =
                            matchScoringEngine.calculate(
                                    trip,
                                    request
                            );

                    return new MatchResponse(
                            trip.id(),
                            trip.driverId(),
                            trip.source(),
                            trip.destination(),
                            trip.departureTime(),
                            trip.arrivalTime(),
                            trip.availableSeats(),
                            trip.price(),
                            differenceMinutes,
                            score.totalScore(),
                            score
                    );
                })
                .filter(match -> match.matchScore() > 0)
                .sorted(
                        Comparator.comparingDouble(
                                MatchResponse::matchScore
                        ).reversed()
                )
                .toList();

        log.info("Matching complete. Returning {} compatible trips.", matches.size());
        log.info("========== MATCHING SEARCH END ==========");

        return matches;
    }
}