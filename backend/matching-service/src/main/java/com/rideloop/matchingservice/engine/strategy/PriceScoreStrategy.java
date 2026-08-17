package com.rideloop.matchingservice.engine.strategy;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.engine.MatchWeight;
import org.springframework.stereotype.Component;

@Component
public class PriceScoreStrategy
        implements MatchScoreStrategy {

    @Override
    public double calculate(
            TripResponse trip,
            MatchRequest request) {

        if (trip.price() == null) {
            return MatchWeight.PRICE * 100;
        }

        double price = trip.price().doubleValue();
        if (price <= 0) {
            return MatchWeight.PRICE * 100;
        }

        double normalized = Math.max(0.2, 1.0 - (price / 200.0));
        return Math.round(normalized * MatchWeight.PRICE * 100.0 * 100.0) / 100.0;
    }
}