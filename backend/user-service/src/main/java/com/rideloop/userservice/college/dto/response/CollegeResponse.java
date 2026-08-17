package com.rideloop.userservice.college.dto.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeResponse {

    private UUID id;

    private String name;

    private String shortName;

    private String emailDomain;

    private String address;

    private String city;

    private String state;

    private String country;

    private Double latitude;

    private Double longitude;
}