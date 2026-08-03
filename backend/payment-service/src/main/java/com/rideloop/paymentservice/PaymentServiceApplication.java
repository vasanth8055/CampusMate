package com.rideloop.paymentservice;

import com.rideloop.commonevents.payment.PaymentEvent;
import com.rideloop.commonevents.payment.PaymentEventType;
import com.rideloop.paymentservice.event.PaymentEventPublisher;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@SpringBootApplication
@EnableFeignClients
public class PaymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                PaymentServiceApplication.class,
                args
        );
    }

    @Bean
    CommandLineRunner testPublisher(
            PaymentEventPublisher publisher) {

        return args -> {
            publisher.publish(
                    new PaymentEvent(
                            UUID.randomUUID(),
                            PaymentEventType.PAYMENT_SUCCESS,
                            UUID.randomUUID(),
                            UUID.randomUUID(),
                            UUID.randomUUID(),
                            UUID.randomUUID(),
                            BigDecimal.valueOf(100),
                            "INR",
                            LocalDateTime.now()
                    )
            );
        };
    }
}