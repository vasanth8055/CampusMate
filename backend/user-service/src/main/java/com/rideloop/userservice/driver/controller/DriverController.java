package com.rideloop.userservice.driver.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.driver.dto.request.BecomeDriverRequest;
import com.rideloop.userservice.driver.dto.response.DriverResponse;
import com.rideloop.userservice.driver.service.interfaces.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping("/become-driver")
    public ResponseEntity<ApiResponse<DriverResponse>> becomeDriver(
            Authentication authentication,
            @Valid
            @RequestBody BecomeDriverRequest request) {

        DriverResponse response =
                driverService.becomeDriver(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver profile created successfully.",
                        response
                )
        );
    }
    @PostMapping(
            value = "/upload-license",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> uploadLicense(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        driverService.uploadLicense(
                authentication.getName(),
                file
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "License uploaded successfully.",
                        null
                )
        );
    }
}