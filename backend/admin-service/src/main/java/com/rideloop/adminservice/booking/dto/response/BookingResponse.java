package com.rideloop.adminservice.booking.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    @JsonAlias({"id", "bookingId"})
    private UUID id;

    @JsonAlias({"bookingId", "id"})
    private UUID bookingId;

    private UUID tripId;
    private UUID riderId;
    private UUID driverId;

    @JsonAlias({"requestedSeats", "seatsBooked"})
    private Integer seatsBooked;

    @JsonAlias({"requestedSeats", "seatsBooked"})
    private Integer requestedSeats;

    private BigDecimal totalFare;
    private String status;
    private String pickupLocation;
    private String dropLocation;
    private String paymentStatus;
    private String riderName;
    private String driverName;
    private LocalDateTime bookingTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UUID getBookingId() {
        return bookingId != null ? bookingId : id;
    }

    public Integer getSeatsBooked() {
        return seatsBooked != null ? seatsBooked : (requestedSeats != null ? requestedSeats : 1);
    }
}
