package com.rideloop.adminservice.report.service.interfaces;

public interface ReportService {

    byte[] exportUsersCsv();

    byte[] exportDriversCsv();

    byte[] exportTripsCsv();

    byte[] exportBookingsCsv();
}
