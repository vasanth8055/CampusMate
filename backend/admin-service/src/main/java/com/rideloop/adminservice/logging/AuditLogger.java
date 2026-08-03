package com.rideloop.adminservice.logging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AuditLogger {

    public void log(String action) {
        log.info("[ADMIN AUDIT] {}", action);
    }
}