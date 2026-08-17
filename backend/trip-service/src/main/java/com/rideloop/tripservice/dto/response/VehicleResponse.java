package com.rideloop.tripservice.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.rideloop.tripservice.enums.VehicleStatus;
import com.rideloop.tripservice.enums.VehicleType;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record VehicleResponse(


        UUID vehicleId,

        UUID driverId,

        VehicleType vehicleType,

        String brand,

        String model,

        String color,

        String registrationNumber,

        Integer maxPassengerCapacity,

        String rcImageUrl,

        VehicleStatus status

) {
}