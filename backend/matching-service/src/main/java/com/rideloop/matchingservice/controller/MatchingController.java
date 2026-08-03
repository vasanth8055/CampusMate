package com.rideloop.matchingservice.controller;

import com.rideloop.matchingservice.dto.request.MatchRequest;
import com.rideloop.matchingservice.dto.response.MatchResponse;
import com.rideloop.matchingservice.service.interfaces.MatchingService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
@Tag(
        name = "Matching APIs",
        description = "APIs for finding suitable RideLoop trips"
)
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/search")
    @Operation(
            summary = "Find matching trips",
            description = "Finds and ranks scheduled trips based on route, seats and departure time."
    )
    public ResponseEntity<ApiResponse<List<MatchResponse>>>
    findMatches(
            @Valid @RequestBody MatchRequest request) {

        List<MatchResponse> matches =
                matchingService.findMatches(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Matching trips fetched successfully",
                        matches
                )
        );
    }
}