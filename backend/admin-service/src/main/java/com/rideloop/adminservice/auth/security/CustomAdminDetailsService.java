package com.rideloop.adminservice.auth.security;

import com.rideloop.adminservice.admin.entity.Admin;
import com.rideloop.adminservice.admin.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomAdminDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Admin not found."));

        return new CustomAdminPrincipal(
                admin.getId(),
                admin.getEmail(),
                admin.getPassword(),
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + admin.getRole().name()
                        )
                )
        );
    }
}