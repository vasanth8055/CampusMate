package com.rideloop.adminservice.admin.initializer;

import com.rideloop.adminservice.admin.entity.Admin;
import com.rideloop.adminservice.admin.entity.enums.AdminRole;
import com.rideloop.adminservice.admin.entity.enums.AdminStatus;
import com.rideloop.adminservice.admin.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (adminRepository.count() > 0) {
            return;
        }

        Admin admin = Admin.builder()
                .firstName("RideLoop")
                .lastName("Admin")
                .email("admin@rideloop.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(AdminRole.ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        adminRepository.save(admin);

        System.out.println("======================================");
        System.out.println("Default Admin Created");
        System.out.println("Email    : admin@rideloop.com");
        System.out.println("Password : Admin@123");
        System.out.println("======================================");
    }
}