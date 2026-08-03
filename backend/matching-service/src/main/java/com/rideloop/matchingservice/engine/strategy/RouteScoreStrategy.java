package com.rideloop.matchingservice.engine.strategy;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.engine.MatchWeight;
import org.springframework.stereotype.Component;

@Component
public class RouteScoreStrategy
        implements MatchScoreStrategy {

    @Override
    public double calculate(
            TripResponse trip,
            MatchRequest request) {

        return MatchWeight.ROUTE * 100;
    }
}