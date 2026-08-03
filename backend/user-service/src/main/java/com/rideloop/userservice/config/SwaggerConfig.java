package com.rideloop.userservice.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI rideLoopOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("RideLoop User Service API")
                        .description("Authentication and User Management APIs for RideLoop.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("RideLoop")
                                .email("support@rideloop.com"))
                        .license(new License()
                                .name("MIT License")))
                .externalDocs(new ExternalDocumentation()
                        .description("RideLoop Documentation"));
    }
}