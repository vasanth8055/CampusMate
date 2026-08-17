package com.rideloop.userservice.security;

import com.rideloop.sharedkernel.security.AuthenticatedUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("===== JWT FILTER =====");

        String authHeader = request.getHeader("Authorization");

        System.out.println("Request : "
                + request.getMethod()
                + " "
                + request.getRequestURI());

        System.out.println("Header : " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("No Bearer Token");

            filterChain.doFilter(request, response);
            return;
        }

        try {

            String jwt = authHeader.substring(7);

            String email = jwtService.extractUsername(jwt);

            System.out.println("Email : " + email);

            if (email != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                System.out.println(
                        "User Loaded : "
                                + userDetails.getUsername()
                );

                boolean valid =
                        jwtService.isTokenValid(
                                jwt,
                                userDetails.getUsername()
                        );

                System.out.println("Token Valid : " + valid);

                if (valid) {

                    CustomUserPrincipal principal =
                            (CustomUserPrincipal) userDetails;

                    AuthenticatedUser authenticatedUser =
                            new AuthenticatedUser(
                                    principal.getId(),
                                    principal.getEmail(),
                                    principal.getRole()
                            );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    authenticatedUser,
                                    null,
                                    principal.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    System.out.println(
                            "Authentication Stored"
                    );

                    System.out.println(
                            "Authenticated User ID : "
                                    + authenticatedUser.getUserId()
                    );

                    System.out.println(
                            "Authenticated User Email : "
                                    + authenticatedUser.getEmail()
                    );

                    System.out.println(
                            "Authenticated User Role : "
                                    + authenticatedUser.getRole()
                    );
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT authentication failed."
            );

            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}