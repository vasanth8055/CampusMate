package com.rideloop.matchingservice.service.interfaces;

import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.dto.response.MatchResponse;

import java.util.List;

public interface MatchingService {

    List<MatchResponse> findMatches(
            MatchRequest request
    );
}