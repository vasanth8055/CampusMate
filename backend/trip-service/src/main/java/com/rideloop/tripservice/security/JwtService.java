package com.rideloop.tripservice.security;

import com.rideloop.sharedkernel.security.AuthenticatedUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret)
        );
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver) {

        return resolver.apply(getClaims(token));
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(
                extractClaim(token,
                        claims -> claims.get("userId", String.class))
        );
    }

    public String extractRole(String token) {
        return extractClaim(token,
                claims -> claims.get("role", String.class));
    }

    public boolean isTokenValid(String token) {
        Date expiry = extractClaim(token, Claims::getExpiration);
        return expiry.after(new Date());
    }

    public AuthenticatedUser getAuthenticatedUser(String token) {

        return new AuthenticatedUser(
                extractUserId(token),
                extractEmail(token),
                extractRole(token)
        );
    }
}