package com.rideloop.userservice.verification.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rideloop.userservice.verification.dto.PendingRegistration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
@RequiredArgsConstructor
public class RedisOtpRepository {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${verification.otp.ttl}")
    private long otpTtl;

    @Value("${verification.registration.ttl}")
    private long registrationTtl;

    public void saveOtp(String key, String otp) {

        redisTemplate.opsForValue()
                .set(key, otp, Duration.ofSeconds(otpTtl));
    }

    public String getOtp(String key) {

        return redisTemplate.opsForValue().get(key);
    }

    public void deleteOtp(String key) {

        redisTemplate.delete(key);
    }

    public boolean exists(String key) {

        Boolean exists = redisTemplate.hasKey(key);

        return Boolean.TRUE.equals(exists);
    }

    // ==========================
    // Pending Registration
    // ==========================

    public void saveRegistration(String key,
                                 PendingRegistration registration) {

        try {

            redisTemplate.opsForValue().set(
                    key,
                    objectMapper.writeValueAsString(registration),
                    Duration.ofSeconds(registrationTtl)
            );

        } catch (JsonProcessingException e) {

            throw new RuntimeException(e);
        }
    }

    public PendingRegistration getRegistration(String key) {

        try {

            String json = redisTemplate.opsForValue().get(key);

            if (json == null) {
                return null;
            }

            return objectMapper.readValue(
                    json,
                    PendingRegistration.class
            );

        } catch (Exception e) {

            throw new RuntimeException(e);
        }
    }

    public void deleteRegistration(String key) {

        redisTemplate.delete(key);
    }

}