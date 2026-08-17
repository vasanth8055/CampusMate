package com.rideloop.adminservice.driver.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {

    @JsonAlias({"vehicleId", "id"})
    private UUID id;
    private UUID vehicleId;
    private UUID driverId;
    private String vehicleType;
    private String brand;
    private String model;
    private String color;
    private String registrationNumber;
    private Integer maxPassengerCapacity;
    private String rcImageUrl;
    private String status;

    public UUID getId() {
        return id != null ? id : vehicleId;
    }
}

