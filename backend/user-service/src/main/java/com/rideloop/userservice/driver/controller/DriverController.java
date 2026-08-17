package com.rideloop.userservice.driver.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
import com.rideloop.userservice.driver.dto.request.BecomeDriverRequest;
import com.rideloop.userservice.driver.dto.response.DriverResponse;
import com.rideloop.userservice.driver.service.interfaces.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    private String getIdentifier(AuthenticatedUser user, Authentication authentication) {
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail();
        }
        if (user != null && user.getUserId() != null) {
            return user.getUserId().toString();
        }
        if (authentication != null && authentication.getName() != null) {
            return authentication.getName();
        }
        throw new IllegalStateException("Unauthenticated user");
    }

    @PostMapping("/become-driver")
    public ResponseEntity<ApiResponse<DriverResponse>> becomeDriver(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @Valid
            @RequestBody BecomeDriverRequest request) {

        String identifier = getIdentifier(user, authentication);
        DriverResponse response =
                driverService.becomeDriver(
                        identifier,
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
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        String identifier = getIdentifier(user, authentication);
        driverService.uploadLicense(
                identifier,
                file
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "License uploaded successfully.",
                        null
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<DriverResponse>> getMyDriver(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication) {

        String identifier = getIdentifier(user, authentication);
        DriverResponse response = driverService.getMyDriver(identifier);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver profile fetched successfully.",
                        response
                )
        );
    }
}