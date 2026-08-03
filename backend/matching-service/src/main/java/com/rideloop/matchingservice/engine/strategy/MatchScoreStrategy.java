package com.rideloop.matchingservice.engine.strategy;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;

public interface MatchScoreStrategy {

    double calculate(
            TripResponse trip,
            MatchRequest request
    );
}