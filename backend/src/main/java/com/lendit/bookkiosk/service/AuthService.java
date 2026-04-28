package com.lendit.bookkiosk.service;

import com.lendit.bookkiosk.dto.AuthResponse;
import com.lendit.bookkiosk.dto.LoginRequest;
import com.lendit.bookkiosk.dto.RegisterRequest;
import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Minimal auth implementation: BCrypt for passwords, random tokens in memory.
 * For production, swap this for Spring Security + JWT.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // token -> userId. In production, use Redis or a signed JWT.
    private final Map<String, Long> tokenStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User(
                req.email(),
                encoder.encode(req.password()),
                req.name(),
                User.Role.STUDENT
        );
        user = userRepository.save(user);
        return issueToken(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return issueToken(user);
    }

    /**
     * Validate the token and return the userId.
     * Throws 401 if the token is missing, malformed, or unknown.
     */
    public Long validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or malformed token");
        }
        String token = authHeader.substring(7);
        Long userId = tokenStore.get(token);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
        return userId;
    }

    /**
     * Validate token AND require that the user has at least the given role.
     * Role hierarchy: ADMIN > STAFF > STUDENT.
     * Throws 401 if not authenticated, 403 if authenticated but unauthorized.
     */
    public User requireRole(String authHeader, User.Role minRole) {
        Long userId = validateToken(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!hasAtLeast(user.getRole(), minRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Requires " + minRole + " role or higher");
        }
        return user;
    }

    /**
     * Returns true if `actual` meets or exceeds `required` in the role hierarchy.
     * ADMIN can do anything STAFF can do; STAFF can do anything STUDENT can do.
     */
    private boolean hasAtLeast(User.Role actual, User.Role required) {
        return rank(actual) >= rank(required);
    }

    private int rank(User.Role role) {
        return switch (role) {
            case STUDENT -> 0;
            case STAFF -> 1;
            case ADMIN -> 2;
        };
    }

    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenStore.remove(authHeader.substring(7));
        }
    }

    private AuthResponse issueToken(User user) {
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, user.getId());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
