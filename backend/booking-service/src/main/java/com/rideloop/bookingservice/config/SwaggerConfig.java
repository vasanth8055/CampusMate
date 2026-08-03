package com.rideloop.bookingservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME =
            "bearerAuth";

    @Bean
    public OpenAPI bookingServiceOpenAPI() {

        return new OpenAPI()

                .info(
                        new Info()
                                .title(
                                        "RideLoop Booking Service API"
                                )
                                .description(
                                        "Booking management APIs for RideLoop riders and drivers."
                                )
                                .version("v1.0")
                                .contact(
                                        new Contact()
                                                .name("RideLoop Team")
                                                .email(
                                                        "support@rideloop.com"
                                                )
                                )
                )

                .addSecurityItem(
                        new SecurityRequirement()
                                .addList(SECURITY_SCHEME)
                )

                .components(
                        new Components()
                                .addSecuritySchemes(
                                        SECURITY_SCHEME,

                                        new SecurityScheme()
                                                .name(
                                                        SECURITY_SCHEME
                                                )
                                                .type(
                                                        SecurityScheme.Type.HTTP
                                                )
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                );
    }
}