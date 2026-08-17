package com.rideloop.adminservice.report.controller;

import com.rideloop.adminservice.report.service.interfaces.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/export/{type}")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String type) {

        byte[] csvData;
        String filename;

        switch (type.toLowerCase()) {
            case "users":
                csvData = reportService.exportUsersCsv();
                filename = "campusmate-users.csv";
                break;
            case "drivers":
                csvData = reportService.exportDriversCsv();
                filename = "campusmate-drivers.csv";
                break;
            case "trips":
                csvData = reportService.exportTripsCsv();
                filename = "campusmate-trips.csv";
                break;
            case "bookings":
                csvData = reportService.exportBookingsCsv();
                filename = "campusmate-bookings.csv";
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
