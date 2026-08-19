package com.rideloop.bookingservice.config;

import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    private static final String GROUP_ID = "booking-service";

    @Value("${spring.kafka.bootstrap-servers:${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}}")
    private String bootstrapServers;

    @Value("${spring.kafka.properties.security.protocol:${KAFKA_SECURITY_PROTOCOL:PLAINTEXT}}")
    private String securityProtocol;

    @Value("${spring.kafka.properties.sasl.mechanism:${KAFKA_SASL_MECHANISM:PLAIN}}")
    private String saslMechanism;

    @Value("${spring.kafka.properties.sasl.jaas.config:${KAFKA_SASL_JAAS_CONFIG:}}")
    private String saslJaasConfig;

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {

        Map<String, Object> props = new HashMap<>();

        props.put(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,
                bootstrapServers
        );

        props.put(
                ConsumerConfig.GROUP_ID_CONFIG,
                GROUP_ID
        );

        props.put(
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,
                "earliest"
        );

        props.put(
                ConsumerConfig.ALLOW_AUTO_CREATE_TOPICS_CONFIG,
                false
        );

        props.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        props.put(
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                JsonDeserializer.class
        );

        props.put(
                JsonDeserializer.TRUSTED_PACKAGES,
                "*"
        );

        props.put(
                JsonDeserializer.USE_TYPE_INFO_HEADERS,
                true
        );

        props.put(
                JsonDeserializer.VALUE_DEFAULT_TYPE,
                Object.class
        );

        if (securityProtocol != null && !securityProtocol.isBlank() && !"PLAINTEXT".equalsIgnoreCase(securityProtocol)) {
            props.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, securityProtocol);
            if (saslMechanism != null && !saslMechanism.isBlank()) {
                props.put(SaslConfigs.SASL_MECHANISM, saslMechanism);
            }
            if (saslJaasConfig != null && !saslJaasConfig.isBlank()) {
                props.put(SaslConfigs.SASL_JAAS_CONFIG, saslJaasConfig);
            }
        }

        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object>
    kafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(
                consumerFactory()
        );

        return factory;
    }
}