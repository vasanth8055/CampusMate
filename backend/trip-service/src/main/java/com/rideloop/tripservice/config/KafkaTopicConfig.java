package com.rideloop.tripservice.config;

import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.config.SaslConfigs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaTopicConfig {

    @Value("${spring.kafka.bootstrap-servers:${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}}")
    private String bootstrapServers;

    @Value("${spring.kafka.properties.security.protocol:${KAFKA_SECURITY_PROTOCOL:PLAINTEXT}}")
    private String securityProtocol;

    @Value("${spring.kafka.properties.sasl.mechanism:${KAFKA_SASL_MECHANISM:PLAIN}}")
    private String saslMechanism;

    @Value("${spring.kafka.properties.sasl.jaas.config:${KAFKA_SASL_JAAS_CONFIG:}}")
    private String saslJaasConfig;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);

        if (securityProtocol != null && !securityProtocol.isBlank() && !"PLAINTEXT".equalsIgnoreCase(securityProtocol)) {
            configs.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, securityProtocol);
            if (saslMechanism != null && !saslMechanism.isBlank()) {
                configs.put(SaslConfigs.SASL_MECHANISM, saslMechanism);
            }
            if (saslJaasConfig != null && !saslJaasConfig.isBlank()) {
                configs.put(SaslConfigs.SASL_JAAS_CONFIG, saslJaasConfig);
            }
        }

        return new KafkaAdmin(configs);
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
