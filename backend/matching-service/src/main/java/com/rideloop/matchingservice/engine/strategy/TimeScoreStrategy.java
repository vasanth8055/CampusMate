package com.rideloop.matchingservice.engine.strategy;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.engine.MatchWeight;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class TimeScoreStrategy implements MatchScoreStrategy {

    @Override
    public double calculate(
            TripResponse trip,
            MatchRequest request) {

        long difference =
                Math.abs(
                        Duration.between(
                                request.preferredDepartureTime(),
                                trip.departureTime()
                        ).toMinutes()
                );

        if (difference >
                request.timeToleranceMinutes()) {
            return 0.0;
        }

        double normalized =
                1.0 -
                        ((double) difference
                                / request.timeToleranceMinutes());

        return normalized * MatchWeight.TIME * 100;
    }
}