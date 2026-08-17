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
    DriverResponse getMyDriver(String userEmail);
    void uploadLicense(
            String userEmail,
            MultipartFile file
    );
    List<DriverResponse> getPendingDrivers();

    List<DriverResponse> getAllDrivers(com.rideloop.userservice.driver.entity.enums.DriverStatus status);

    DriverResponse getDriver(UUID driverId);

    void approveDriver(UUID driverId);

    void rejectDriver(UUID driverId);

    void rejectDriver(UUID driverId, String reason);

    void suspendDriver(UUID driverId, String reason);

    void restoreDriver(UUID driverId);

    boolean isDriverApproved(UUID driverId);
}