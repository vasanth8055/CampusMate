package com.rideloop.userservice.college.mapper;

import com.rideloop.userservice.college.dto.response.CollegeResponse;
import com.rideloop.userservice.college.entity.College;
import org.springframework.stereotype.Component;

@Component
public class CollegeMapper {

    public CollegeResponse toResponse(College college) {

        return CollegeResponse.builder()
                .id(college.getId())
                .name(college.getName())
                .shortName(college.getShortName())
                .emailDomain(college.getEmailDomain())
                .address(college.getAddress())
                .city(college.getCity())
                .state(college.getState())
                .country(college.getCountry())
                .latitude(college.getLatitude())
                .longitude(college.getLongitude())
                .build();
    }
}