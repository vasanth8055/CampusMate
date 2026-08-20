package com.rideloop.tripservice.config;

import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.common.config.SaslConfigs;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class KafkaCommonConfig {

    private final Environment env;

    public KafkaCommonConfig(Environment env) {
        this.env = env;
    }

    public String getBootstrapServers() {
        String servers = System.getenv("KAFKA_BOOTSTRAP_SERVERS");
        if (servers != null && !servers.isBlank()) return servers.trim();
        servers = env.getProperty("spring.kafka.bootstrap-servers");
        if (servers != null && !servers.isBlank()) return servers.trim();
        return "localhost:9092";
    }

    public String getSecurityProtocol() {
        String protocol = System.getenv("KAFKA_SECURITY_PROTOCOL");
        if (protocol != null && !protocol.isBlank()) return protocol.trim();
        protocol = env.getProperty("spring.kafka.properties.security.protocol");
        if (protocol != null && !protocol.isBlank()) return protocol.trim();
        return "PLAINTEXT";
    }

    public String getSaslMechanism() {
        String mechanism = System.getenv("KAFKA_SASL_MECHANISM");
        if (mechanism != null && !mechanism.isBlank()) return mechanism.trim();
        mechanism = env.getProperty("spring.kafka.properties.sasl.mechanism");
        if (mechanism != null && !mechanism.isBlank()) return mechanism.trim();
        return "PLAIN";
    }

    public String getSaslJaasConfig() {
        String jaas = System.getenv("KAFKA_SASL_JAAS_CONFIG");
        if (jaas != null && !jaas.isBlank()) return cleanJaas(jaas);
        jaas = env.getProperty("spring.kafka.properties.sasl.jaas.config");
        if (jaas != null && !jaas.isBlank()) return cleanJaas(jaas);
        return null;
    }

    public Map<String, Object> getCommonConfigs() {
        Map<String, Object> props = new HashMap<>();
        props.put(CommonClientConfigs.BOOTSTRAP_SERVERS_CONFIG, getBootstrapServers());

        String securityProtocol = getSecurityProtocol();
        if (securityProtocol != null && !securityProtocol.isBlank() && !"PLAINTEXT".equalsIgnoreCase(securityProtocol)) {
            props.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, securityProtocol);

            String saslMechanism = getSaslMechanism();
            if (saslMechanism != null && !saslMechanism.isBlank()) {
                props.put(SaslConfigs.SASL_MECHANISM, saslMechanism);
            }

            String saslJaas = getSaslJaasConfig();
            if (saslJaas != null && !saslJaas.isBlank()) {
                props.put(SaslConfigs.SASL_JAAS_CONFIG, saslJaas);
            }
        }
        return props;
    }

    private String cleanJaas(String jaas) {
        String trimmed = jaas.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        if (trimmed.contains("\\\"")) {
            trimmed = trimmed.replace("\\\"", "\"");
        }
        return trimmed;
    }
}
