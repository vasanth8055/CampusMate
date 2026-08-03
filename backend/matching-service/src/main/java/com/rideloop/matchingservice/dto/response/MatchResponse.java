package com.rideloop.matchingservice.dto.response;

import com.rideloop.matchingservice.engine.model.MatchScore;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MatchResponse(

        UUID tripId,
        UUID driverId,

        String source,
        String destination,

        LocalDateTime departureTime,
        LocalDateTime arrivalTime,

        Integer availableSeats,
        BigDecimal price,

        long departureDifferenceMinutes,

        double matchScore,

        MatchScore scoreBreakdown

) {
}