package com.rideloop.tripservice.config;

import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.properties.security.protocol:${KAFKA_SECURITY_PROTOCOL:PLAINTEXT}}")
    private String securityProtocol;

    @Value("${spring.kafka.properties.sasl.mechanism:${KAFKA_SASL_MECHANISM:PLAIN}}")
    private String saslMechanism;

    @Value("${spring.kafka.properties.sasl.jaas.config:${KAFKA_SASL_JAAS_CONFIG:}}")
    private String saslJaasConfig;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {

        Map<String, Object> config = new HashMap<>();

        config.put(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
                bootstrapServers
        );

        config.put(
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                StringSerializer.class
        );

        config.put(
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                JsonSerializer.class
        );

        if (securityProtocol != null && !securityProtocol.isBlank() && !"PLAINTEXT".equalsIgnoreCase(securityProtocol)) {
            config.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, securityProtocol);
            if (saslMechanism != null && !saslMechanism.isBlank()) {
                config.put(SaslConfigs.SASL_MECHANISM, saslMechanism);
            }
            if (saslJaasConfig != null && !saslJaasConfig.isBlank()) {
                config.put(SaslConfigs.SASL_JAAS_CONFIG, saslJaasConfig);
            }
        }

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {

        return new KafkaTemplate<>(
                producerFactory()
        );
    }
}