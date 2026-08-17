package com.rideloop.userservice.user.mapper;

import com.rideloop.userservice.auth.dto.request.RegisterRequest;
import com.rideloop.userservice.user.dto.UserResponse;
import com.rideloop.userservice.user.entity.User;
import org.springframework.stereotype.Component;
import com.rideloop.userservice.verification.dto.PendingRegistration;
@Component
public class UserMapper {

    public User toEntity(RegisterRequest request) {

        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phoneNumber(request.getPhoneNumber())
                .collegeEmail(request.getCollegeEmail())
                .build();
    }

    public UserResponse toResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .homeAddress(user.getHomeAddress())
                .homeLatitude(user.getHomeLatitude())
                .homeLongitude(user.getHomeLongitude())
                .emailVerified(user.isEmailVerified())
                .collegeEmail(user.getCollegeEmail())
                .collegeVerified(user.isCollegeVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    public User toEntity(PendingRegistration request) {

        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phoneNumber(request.getPhoneNumber())
                .collegeEmail(request.getCollegeEmail())
                .build();
    }
}