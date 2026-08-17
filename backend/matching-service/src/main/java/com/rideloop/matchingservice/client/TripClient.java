package com.rideloop.matchingservice.client;

import com.rideloop.matchingservice.dto.client.TripResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.List;

@FeignClient(name = "trip-service", url = "${trip.service.url:http://localhost:8082}")
public interface TripClient {


    @GetMapping("/internal/v1/trips/search")
    ApiResponse<List<TripResponse>> searchAvailableTrips(

            @RequestParam(value = "source", required = false)
            String source,

            @RequestParam("destination")
            String destination,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to,

            @RequestParam("seats")
            Integer seats
    );
}