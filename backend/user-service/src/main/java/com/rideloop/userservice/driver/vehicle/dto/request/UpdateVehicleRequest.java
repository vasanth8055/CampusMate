package com.rideloop.userservice.driver.vehicle.dto.request;

import com.rideloop.userservice.driver.vehicle.entity.enums.VehicleType;
import jakarta.validation.constraints.*;

public record UpdateVehicleRequest(

        @NotNull
        VehicleType vehicleType,

        @NotBlank
        @Size(max = 50)
        String brand,

        @NotBlank
        @Size(max = 50)
        String model,

        @NotBlank
        @Size(max = 30)
        String color,

        @NotBlank
        @Size(max = 20)
        String registrationNumber,

        @NotNull
        @Min(1)
        @Max(6)
        Integer maxPassengerCapacity

) {
}