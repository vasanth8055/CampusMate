package com.rideloop.matchingservice.engine.model;

import lombok.Builder;

@Builder
public record MatchScore(

        double routeScore,

        double timeScore,

        double seatScore,

        double recurringScore,

        double priceScore,

        double totalScore

) {
}