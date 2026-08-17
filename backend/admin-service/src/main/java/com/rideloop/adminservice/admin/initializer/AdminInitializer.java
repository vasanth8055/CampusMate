package com.rideloop.adminservice.admin.initializer;

import com.rideloop.adminservice.admin.entity.Admin;
import com.rideloop.adminservice.admin.entity.enums.AdminRole;
import com.rideloop.adminservice.admin.entity.enums.AdminStatus;
import com.rideloop.adminservice.admin.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:${ADMIN_EMAIL:campusmate.teamofficial@gmail.com}}")
    private String adminEmail;

    @Value("${admin.password:${ADMIN_PASSWORD}}")
    private String adminPassword;

    @Value("${admin.firstName:${ADMIN_FIRST_NAME:Vasanth}}")
    private String adminFirstName;

    @Value("${admin.lastName:${ADMIN_LAST_NAME:}}")
    private String adminLastName;

    @Override
    public void run(String... args) {
        syncMasterAdmin();
    }

    private void syncMasterAdmin() {
        String targetEmail = (adminEmail != null && !adminEmail.isBlank())
                ? adminEmail.trim().toLowerCase()
                : "campusmate.teamofficial@gmail.com";
        String firstName = (adminFirstName != null && !adminFirstName.isBlank())
                ? adminFirstName.trim()
                : "Vasanth";
        String lastName = (adminLastName != null) ? adminLastName.trim() : "";
        String encodedPassword = passwordEncoder.encode(adminPassword);

        // Find existing master admin: by target email, legacy email, or first available record
        Optional<Admin> existing = adminRepository.findByEmail(targetEmail);
        if (existing.isEmpty()) {
            existing = adminRepository.findByEmail("rideloop.team@gmail.com");
        }
        if (existing.isEmpty()) {
            existing = adminRepository.findByEmail("admin@campusmate.edu");
        }
        if (existing.isEmpty()) {
            existing = adminRepository.findByEmail("vasanth@campusmate.edu");
        }

        Admin masterAdmin;
        if (existing.isPresent()) {
            masterAdmin = existing.get();
            masterAdmin.setEmail(targetEmail);
            masterAdmin.setFirstName(firstName);
            masterAdmin.setLastName(lastName);
            masterAdmin.setPassword(encodedPassword);
            masterAdmin.setRole(AdminRole.ADMIN);
            masterAdmin.setStatus(AdminStatus.ACTIVE);
            adminRepository.save(masterAdmin);
            log.info("Updated existing master admin: {} ({})", targetEmail, firstName);
        } else {
            masterAdmin = Admin.builder()
                    .email(targetEmail)
                    .firstName(firstName)
                    .lastName(lastName)
                    .password(encodedPassword)
                    .role(AdminRole.ADMIN)
                    .status(AdminStatus.ACTIVE)
                    .build();
            adminRepository.save(masterAdmin);
            log.info("Created master admin: {} ({})", targetEmail, firstName);
        }

        // Clean up obsolete seed records if they differ from target master admin
        List<String> legacyEmails = List.of(
                "rideloop.team@gmail.com",
                "admin@campusmate.edu",
                "ops@campusmate.edu",
                "vasanth@campusmate.edu"
        );
        for (String legacyEmail : legacyEmails) {
            if (!legacyEmail.equalsIgnoreCase(targetEmail)) {
                adminRepository.findByEmail(legacyEmail).ifPresent(obsolete -> {
                    if (!obsolete.getId().equals(masterAdmin.getId())) {
                        adminRepository.delete(obsolete);
                        log.info("Removed legacy admin seed: {}", legacyEmail);
                    }
                });
            }
        }
    }
}