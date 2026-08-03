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
                .build();
    }
}