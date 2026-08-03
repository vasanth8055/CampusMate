package com.rideloop.matchingservice.engine;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.engine.model.MatchScore;
import com.rideloop.matchingservice.engine.strategy.PriceScoreStrategy;
import com.rideloop.matchingservice.engine.strategy.RecurringScoreStrategy;
import com.rideloop.matchingservice.engine.strategy.RouteScoreStrategy;
import com.rideloop.matchingservice.engine.strategy.SeatScoreStrategy;
import com.rideloop.matchingservice.engine.strategy.TimeScoreStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MatchScoringEngine {

    private final RouteScoreStrategy routeScoreStrategy;
    private final TimeScoreStrategy timeScoreStrategy;
    private final SeatScoreStrategy seatScoreStrategy;
    private final PriceScoreStrategy priceScoreStrategy;
    private final RecurringScoreStrategy recurringScoreStrategy;

    public MatchScore calculate(
            TripResponse trip,
            MatchRequest request) {

        double route =
                routeScoreStrategy.calculate(
                        trip,
                        request
                );

        double time =
                timeScoreStrategy.calculate(
                        trip,
                        request
                );

        double seats =
                seatScoreStrategy.calculate(
                        trip,
                        request
                );

        double recurring =
                recurringScoreStrategy.calculate(
                        trip,
                        request
                );

        double price =
                priceScoreStrategy.calculate(
                        trip,
                        request
                );

        double total =
                route
                        + time
                        + seats
                        + recurring
                        + price;

        total = Math.round(total * 100.0) / 100.0;

        return MatchScore.builder()

                .routeScore(route)

                .timeScore(time)

                .seatScore(seats)

                .recurringScore(recurring)

                .priceScore(price)

                .totalScore(total)

                .build();
    }
}