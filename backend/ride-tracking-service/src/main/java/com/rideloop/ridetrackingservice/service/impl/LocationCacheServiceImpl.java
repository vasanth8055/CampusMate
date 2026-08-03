package com.rideloop.ridetrackingservice.service.impl;

import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;
import com.rideloop.ridetrackingservice.service.interfaces.LocationCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationCacheServiceImpl
        implements LocationCacheService {

    private static final String PREFIX = "tracking:trip:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void saveLatestLocation(
            RideLocationResponse location) {

        redisTemplate.opsForValue().set(
                PREFIX + location.tripId(),
                location,
                Duration.ofHours(6)
        );
    }

    @Override
    public RideLocationResponse getLatestLocation(
            UUID tripId) {

        Object value =
                redisTemplate.opsForValue().get(
                        PREFIX + tripId
                );

        if (value == null) {
            return null;
        }

        return (RideLocationResponse) value;
    }
}