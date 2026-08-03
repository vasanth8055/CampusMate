package com.rideloop.paymentservice.security;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeignAuthInterceptor implements RequestInterceptor {

    private final HttpServletRequest request;

    @Override
    public void apply(feign.RequestTemplate template) {

        String authorization =
                request.getHeader("Authorization");

        if (authorization != null
                && authorization.startsWith("Bearer ")) {

            template.header(
                    "Authorization",
                    authorization
            );
        }
    }
}