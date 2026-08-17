package com.rideloop.tripservice.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DriverInfoResponse(

        UUID driverId,

        String firstName,

        String lastName,

        String email

) {
}