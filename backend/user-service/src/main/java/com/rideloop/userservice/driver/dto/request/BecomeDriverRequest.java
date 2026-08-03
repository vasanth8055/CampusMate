package com.rideloop.userservice.driver.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BecomeDriverRequest {

    @NotBlank
    private String drivingLicenseNumber;
}