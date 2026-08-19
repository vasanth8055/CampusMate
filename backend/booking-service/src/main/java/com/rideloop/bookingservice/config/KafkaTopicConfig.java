package com.rideloop.bookingservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(name = "spring.kafka.admin.auto-create", havingValue = "true", matchIfMissing = false)
public class KafkaTopicConfig {

    @Bean
    public NewTopic bookingEventsTopic() {

        return TopicBuilder
                .name("booking-events")
                .partitions(3)
                .replicas(1)
                .build();
    }
}