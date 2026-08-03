package com.rideloop.matchingservice.engine.strategy;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.engine.MatchWeight;
import org.springframework.stereotype.Component;

@Component
public class SeatScoreStrategy
        implements MatchScoreStrategy {

    @Override
    public double calculate(
            TripResponse trip,
            MatchRequest request) {

        if (trip.availableSeats() <
                request.requiredSeats()) {

            return 0;
        }

        double ratio =
                (double) request.requiredSeats()
                        / trip.availableSeats();

        return ratio
                * MatchWeight.SEATS
                * 100;
    }
}