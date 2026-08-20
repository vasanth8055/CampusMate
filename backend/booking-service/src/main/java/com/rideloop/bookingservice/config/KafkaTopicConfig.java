package com.rideloop.bookingservice.config;

import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;

@Configuration
@RequiredArgsConstructor
public class KafkaTopicConfig {

    private final KafkaCommonConfig kafkaCommonConfig;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        return new KafkaAdmin(kafkaCommonConfig.getCommonConfigs());
    }

    @Bean
    public NewTopic bookingEventsTopic() {
        return TopicBuilder
                .name("booking-events")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic tripEventsTopic() {
        return TopicBuilder
                .name("trip-events")
                .partitions(3)
                .replicas(1)
                .build();
    }
}