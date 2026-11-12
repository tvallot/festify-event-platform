package com.festify;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.festify.models.User;
import com.festify.repositories.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;

    @PersistenceContext
    protected EntityManager entityManager;

    /**
     * Tests run in a single transaction, so entities stay cached between requests.
     * Call this before reading values the database computes (e.g. @Formula fields).
     */
    protected void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    /** Roles cannot be set through the API, so test admins are promoted directly in the database. */
    protected String registerAdminAndGetToken(String email) throws Exception {
        registerUser("Admin", "User", email, "123456");
        User admin = userRepository.findByEmail(email).orElseThrow();
        admin.setRole("ADMIN");
        userRepository.save(admin);
        return loginAndGetToken(email, "123456");
    }

    protected String extractToken(String response) {
        return response.split("\"token\":\"")[1].split("\"")[0];
    }

    protected String registerAndGetToken(String firstName, String lastName, String email, String password) throws Exception {
        String registerJson = """
        {
            "firstName": "%s",
            "lastName": "%s",
            "email": "%s",
            "password": "%s"
        }
        """.formatted(firstName, lastName, email, password);

        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return extractToken(response);
    }

    protected void registerUser(String firstName, String lastName, String email, String password) throws Exception {
        String registerJson = """
        {
            "firstName": "%s",
            "lastName": "%s",
            "email": "%s",
            "password": "%s"
        }
        """.formatted(firstName, lastName, email, password);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated());
    }

    protected String loginAndGetToken(String email, String password) throws Exception {
        String loginJson = """
        {
            "email": "%s",
            "password": "%s"
        }
        """.formatted(email, password);

        String response = mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return extractToken(response);
    }
}