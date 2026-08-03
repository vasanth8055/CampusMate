package com.rideloop.matchingservice.service.impl;

import com.rideloop.matchingservice.client.TripClient;
import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.dto.response.MatchResponse;
import com.rideloop.matchingservice.engine.MatchScoringEngine;
import com.rideloop.matchingservice.engine.model.MatchScore;
import com.rideloop.matchingservice.service.interfaces.MatchingService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchingServiceImpl implements MatchingService {

    private final TripClient tripClient;
    private final MatchScoringEngine matchScoringEngine;

    @Override
    public List<MatchResponse> findMatches(
            MatchRequest request) {

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
                        request.source().trim(),
                        request.destination().trim(),
                        from,
                        to,
                        request.requiredSeats()
                );

        List<TripResponse> trips = response.getData();

        if (trips == null || trips.isEmpty()) {
            return List.of();
        }

        return trips.stream()

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

                .sorted(
                        Comparator.comparingDouble(
                                MatchResponse::matchScore
                        ).reversed()
                )

                .toList();
    }
}