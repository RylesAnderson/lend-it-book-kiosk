package com.lendit.bookkiosk.config;

import com.lendit.bookkiosk.model.User;
import com.lendit.bookkiosk.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Seeds default test accounts on every startup.
 * With H2 in-memory the database resets each restart, so this gives us
 * predictable accounts for testing role-based features.
 *
 * REMOVE OR PROFILE-GATE THIS BEFORE DEPLOYING TO PRODUCTION.
 */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository) {
        return args -> {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            seedIfMissing(userRepository, encoder, "student@test.com",
                    "Test Student", "password123", User.Role.STUDENT);
            seedIfMissing(userRepository, encoder, "staff@test.com",
                    "Test Staff", "password123", User.Role.STAFF);
            seedIfMissing(userRepository, encoder, "admin@test.com",
                    "Test Admin", "password123", User.Role.ADMIN);
        };
    }

    private void seedIfMissing(UserRepository repo, BCryptPasswordEncoder encoder,
                               String email, String name, String password, User.Role role) {
        if (!repo.existsByEmail(email)) {
            repo.save(new User(email, encoder.encode(password), name, role));
            System.out.println("Seeded test user: " + email + " (" + role + ")");
        }
    }
}
