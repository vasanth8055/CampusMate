package com.rideloop.adminservice.trip.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripResponse {

    private UUID id;
    private UUID driverId;
    private UUID vehicleId;
    private String source;
    private String destination;
    private Double sourceLatitude;
    private Double sourceLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private LocalDateTime departureTime;
    private LocalDateTime estimatedArrivalTime;
    private Integer availableSeats;
    private Integer totalSeats;
    private BigDecimal farePerSeat;
    private String status;
    private String driverName;
    private String driverPhone;
    private String vehicleModel;
    private String vehicleRegistrationNumber;
    private LocalDateTime createdAt;
}
