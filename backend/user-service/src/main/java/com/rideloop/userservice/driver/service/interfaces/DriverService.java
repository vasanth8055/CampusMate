package com.rideloop.userservice.driver.service.interfaces;

import com.rideloop.userservice.driver.dto.request.BecomeDriverRequest;
import com.rideloop.userservice.driver.dto.response.DriverResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;
import java.util.List;


public interface DriverService {

    DriverResponse becomeDriver(
            String userEmail,
            BecomeDriverRequest request
    );
    void uploadLicense(
            String userEmail,
            MultipartFile file
    );
    List<DriverResponse> getPendingDrivers();

    DriverResponse getDriver(UUID driverId);

    void approveDriver(UUID driverId);

    void rejectDriver(UUID driverId);
    boolean isDriverApproved(UUID driverId);
}