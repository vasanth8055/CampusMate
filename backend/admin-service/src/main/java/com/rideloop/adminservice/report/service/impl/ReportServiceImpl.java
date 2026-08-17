package com.rideloop.adminservice.report.service.impl;

import com.rideloop.adminservice.client.BookingServiceClient;
import com.rideloop.adminservice.client.TripServiceClient;
import com.rideloop.adminservice.client.UserServiceClient;
import com.rideloop.adminservice.report.service.interfaces.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final UserServiceClient userServiceClient;
    private final TripServiceClient tripServiceClient;
    private final BookingServiceClient bookingServiceClient;

    @Override
    public byte[] exportUsersCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("User ID,First Name,Last Name,Email,Phone,Role,Status,College,College Verified,Joined Date\n");

        try {
            var res = userServiceClient.getUsers();
            if (res != null && res.getData() != null) {
                for (var u : res.getData()) {
                    sb.append(escape(u.getId()))
                            .append(",").append(escape(u.getFirstName()))
                            .append(",").append(escape(u.getLastName()))
                            .append(",").append(escape(u.getEmail()))
                            .append(",").append(escape(u.getPhoneNumber()))
                            .append(",").append(escape(u.getRole()))
                            .append(",").append(escape(u.getStatus()))
                            .append(",").append(escape(u.getCollegeName()))
                            .append(",").append(u.isCollegeVerified())
                            .append(",").append(escape(u.getCreatedAt()))
                            .append("\n");
                }
            }
        } catch (Exception ignored) {}

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] exportDriversCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("Driver ID,User ID,Name,Email,License Number,Status,Vehicle Model,Registration Plate,Applied Date\n");

        try {
            var res = userServiceClient.getAllDrivers(null);
            if (res != null && res.getData() != null) {
                for (var d : res.getData()) {
                    String vehModel = d.getVehicle() != null ? d.getVehicle().getBrand() + " " + d.getVehicle().getModel() : "N/A";
                    String vehPlate = d.getVehicle() != null ? d.getVehicle().getRegistrationNumber() : "N/A";

                    sb.append(escape(d.getDriverId()))
                            .append(",").append(escape(d.getUserId()))
                            .append(",").append(escape(d.getFirstName() + " " + d.getLastName()))
                            .append(",").append(escape(d.getEmail()))
                            .append(",").append(escape(d.getDrivingLicenseNumber()))
                            .append(",").append(escape(d.getStatus()))
                            .append(",").append(escape(vehModel))
                            .append(",").append(escape(vehPlate))
                            .append(",").append(escape(d.getCreatedAt()))
                            .append("\n");
                }
            }
        } catch (Exception ignored) {}

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] exportTripsCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("Trip ID,Driver ID,Source,Destination,Departure Time,Available Seats,Total Seats,Fare Per Seat,Status,Created At\n");

        try {
            var res = tripServiceClient.getAllTrips(null, null);
            if (res != null && res.getData() != null) {
                for (var t : res.getData()) {
                    sb.append(escape(t.getId()))
                            .append(",").append(escape(t.getDriverId()))
                            .append(",").append(escape(t.getSource()))
                            .append(",").append(escape(t.getDestination()))
                            .append(",").append(escape(t.getDepartureTime()))
                            .append(",").append(t.getAvailableSeats())
                            .append(",").append(t.getTotalSeats())
                            .append(",").append(t.getFarePerSeat())
                            .append(",").append(escape(t.getStatus()))
                            .append(",").append(escape(t.getCreatedAt()))
                            .append("\n");
                }
            }
        } catch (Exception ignored) {}

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] exportBookingsCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("Booking ID,Trip ID,Rider ID,Driver ID,Seats Booked,Total Fare,Status,Pickup,Drop,Payment Status,Created At\n");

        try {
            var res = bookingServiceClient.getAllBookings();
            if (res != null && res.getData() != null) {
                for (var b : res.getData()) {
                    sb.append(escape(b.getBookingId()))
                            .append(",").append(escape(b.getTripId()))
                            .append(",").append(escape(b.getRiderId()))
                            .append(",").append(escape(b.getDriverId()))
                            .append(",").append(b.getSeatsBooked())
                            .append(",").append(b.getTotalFare())
                            .append(",").append(escape(b.getStatus()))
                            .append(",").append(escape(b.getPickupLocation()))
                            .append(",").append(escape(b.getDropLocation()))
                            .append(",").append(escape(b.getPaymentStatus()))
                            .append(",").append(escape(b.getCreatedAt()))
                            .append("\n");
                }
            }
        } catch (Exception ignored) {}

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escape(Object val) {
        if (val == null) return "";
        String s = val.toString().replace("\"", "\"\"");
        if (s.contains(",") || s.contains("\n") || s.contains("\"")) {
            return "\"" + s + "\"";
        }
        return s;
    }
}
