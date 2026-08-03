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
}