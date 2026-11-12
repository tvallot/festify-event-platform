package com.festify;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class AuthIntegrationTest extends BaseIntegrationTest {

    @Test
    void register_should_return_token() throws Exception {
        String json = """
        {
            "firstName": "Test",
            "lastName": "User",
            "email": "register@test.com",
            "password": "123456"
        }
        """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("register@test.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void login_should_return_token() throws Exception {
        registerUser("Login", "User", "login@test.com", "123456");

        String loginJson = """
        {
            "email": "login@test.com",
            "password": "123456"
        }
        """;

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void logout_should_work_with_token() throws Exception {
        String token = registerAndGetToken("Logout", "User", "logout@test.com", "123456");

        mockMvc.perform(post("/api/users/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Logout successful"));
    }

    @Test
    void register_with_existing_email_should_fail() throws Exception {
        registerUser("Test", "User", "duplicate@test.com", "123456");

        String json = """
    {
        "firstName": "Test2",
        "lastName": "User2",
        "email": "duplicate@test.com",
        "password": "123456"
    }
    """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isConflict());
    }

    @Test
    void login_with_wrong_password_should_fail() throws Exception {
        registerUser("Test", "User", "wrongpass@test.com", "123456");

        String json = """
    {
        "email": "wrongpass@test.com",
        "password": "wrongpassword"
    }
    """;

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_with_unknown_email_should_fail() throws Exception {
        String json = """
    {
        "email": "unknown@test.com",
        "password": "123456"
    }
    """;

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_without_token_should_fail() throws Exception {
        mockMvc.perform(post("/api/users/logout"))
                .andExpect(status().isForbidden());
    }
}