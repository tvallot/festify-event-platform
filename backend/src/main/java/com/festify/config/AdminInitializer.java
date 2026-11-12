package com.festify.config;

import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.festify.models.User;
import com.festify.repositories.UserRepository;

/**
 * Creates an admin account on startup when ADMIN_EMAIL and ADMIN_PASSWORD are set.
 * Roles cannot be assigned through the API, so this is the only way to get a first admin.
 */
@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final String email;
    private final String password;

    public AdminInitializer(UserRepository userRepository,
                            @Value("${app.admin.email:}") String email,
                            @Value("${app.admin.password:}") String password) {
        this.userRepository = userRepository;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank() || userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User admin = new User();
        admin.setEmail(email);
        admin.setFirstName("Admin");
        admin.setLastName("Festify");
        admin.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));
        admin.setRole("ADMIN");
        admin.setProfilePicture("1");
        userRepository.save(admin);

        log.info("Created admin account {}", email);
    }
}
