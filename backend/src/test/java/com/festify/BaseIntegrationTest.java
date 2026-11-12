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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") 
@Transactional 
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

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