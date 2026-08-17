package com.rideloop.userservice.driver.vehicle.dto.response;

import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleStatus;
import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleType;

import java.util.UUID;

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