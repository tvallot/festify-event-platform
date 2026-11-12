package com.festify;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.festify.models.User;

public class UserIntegrationTest extends BaseIntegrationTest {

    @Test
    void register_should_ignore_role_sent_by_client() throws Exception {
        String json = """
        {
            "firstName": "Sneaky",
            "lastName": "User",
            "email": "sneaky@test.com",
            "password": "123456",
            "role": "ADMIN"
        }
        """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("USER"));

        assertEquals("USER", userRepository.findByEmail("sneaky@test.com").orElseThrow().getRole());
    }

    @Test
    void password_should_be_hashed_and_never_returned() throws Exception {
        String token = registerAndGetToken("Hash", "User", "hash@test.com", "123456");

        User user = userRepository.findByEmail("hash@test.com").orElseThrow();
        assertNull(user.getPassword());
        assertTrue(user.getPasswordHash().startsWith("$2a$"));

        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void update_other_user_profile_should_fail() throws Exception {
        String attackerToken = registerAndGetToken("Attacker", "User", "attacker@test.com", "123456");
        registerUser("Victim", "User", "victim@test.com", "123456");
        User victim = userRepository.findByEmail("victim@test.com").orElseThrow();

        mockMvc.perform(put("/api/users/" + victim.getId())
                        .header("Authorization", "Bearer " + attackerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"firstName\": \"Hacked\" }"))
                .andExpect(status().isForbidden());

        assertEquals("Victim", userRepository.findByEmail("victim@test.com").orElseThrow().getFirstName());
    }

    @Test
    void admin_can_update_other_user_profile() throws Exception {
        String adminToken = registerAdminAndGetToken("admin.update.user@test.com");
        registerUser("Target", "User", "target.update@test.com", "123456");
        User target = userRepository.findByEmail("target.update@test.com").orElseThrow();

        mockMvc.perform(put("/api/users/" + target.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"firstName\": \"Renamed\" }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Renamed"));
    }

    @Test
    void get_all_users_as_user_should_fail() throws Exception {
        registerUser("Normal", "User", "userall@test.com", "123456");
        String token = loginAndGetToken("userall@test.com", "123456");

        mockMvc.perform(get("/api/users/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void delete_account_should_work_with_token() throws Exception {
        String token = registerAndGetToken("Delete", "User", "delete@test.com", "123456");

        mockMvc.perform(delete("/api/users/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Account deleted successfully"));
    }

    @Test
    void profile_should_require_valid_token() throws Exception {
        registerUser("Profile", "User", "profile@test.com", "123456");
        String token = loginAndGetToken("profile@test.com", "123456");

        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("profile@test.com"));
    }

    @Test
    void like_event_should_work_with_token() throws Exception {
        String token = registerAndGetToken("Like", "User", "like@test.com", "123456");

        String eventJson = """
        {
            "title": "Like Event",
            "description": "Test favorite event",
            "startDate": "2026-04-10",
            "endDate": "2026-04-12",
            "capacity": 100,
            "location": "Lyon",
            "category": "Music",
            "thumbnailUrl": "https://example.com/event.jpg",
            "isFree": true
        }
        """;

        String eventResponse = mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String eventId = eventResponse.split("\"id\":")[1].split(",")[0].trim();

        mockMvc.perform(post("/api/users/profile/like/" + eventId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Event added to favorites"));
    }

    @Test
    void get_all_users_as_admin_should_work() throws Exception {
        registerUser("Admin", "User", "admin@test.com", "123456");

        User admin = userRepository.findByEmail("admin@test.com").orElseThrow();
        admin.setRole("ADMIN");
        userRepository.save(admin);

        String token = loginAndGetToken("admin@test.com", "123456");

        mockMvc.perform(get("/api/users/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void update_profile_should_work_with_token() throws Exception {
        String token = registerAndGetToken("Update", "User", "update@test.com", "123456");

        String updateJson = """
    {
        "firstName": "Updated",
        "lastName": "Name"
    }
    """;

        mockMvc.perform(put("/api/users/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"));
    }

    @Test
    void update_profile_without_token_should_fail() throws Exception {
        String updateJson = """
    {
        "firstName": "Updated",
        "lastName": "Name"
    }
    """;

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void get_my_events_should_return_created_and_joined_events() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "User", "creator@test.com", "123456");
        String joinerToken = registerAndGetToken("Joiner", "User", "joiner@test.com", "123456");

        String eventJson = """
    {
        "title": "Profile Events Test",
        "description": "Event for profile events",
        "startDate": "2026-05-10",
        "endDate": "2026-05-12",
        "capacity": 100,
        "location": "Lyon",
        "category": "Music",
        "thumbnailUrl": "https://example.com/event.jpg",
        "isFree": true
    }
    """;

        String eventResponse = mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + creatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String eventId = eventResponse.split("\"id\":")[1].split(",")[0].trim();

        mockMvc.perform(post("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/profile/events")
                        .header("Authorization", "Bearer " + creatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.createdEvents").isArray());

        mockMvc.perform(get("/api/users/profile/events")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upcomingEvents").isArray());
    }

    @Test
    void remove_favorite_should_work() throws Exception {
        String token = registerAndGetToken("Remove", "Favorite", "removefav@test.com", "123456");

        String eventJson = """
    {
        "title": "Favorite Remove Test",
        "description": "Event for removing favorite",
        "startDate": "2026-06-10",
        "endDate": "2026-06-12",
        "capacity": 50,
        "location": "Paris",
        "category": "Tech",
        "thumbnailUrl": "https://example.com/fav.jpg",
        "isFree": true
    }
    """;

        String eventResponse = mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String eventId = eventResponse.split("\"id\":")[1].split(",")[0].trim();

        mockMvc.perform(post("/api/users/profile/like/" + eventId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/users/profile/like/" + eventId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Event removed from favorites"));
    }

    @Test
    void remove_favorite_that_does_not_exist_should_fail() throws Exception {
        String token = registerAndGetToken("No", "Favorite", "nofav@test.com", "123456");

        String eventJson = """
    {
        "title": "Favorite Missing Test",
        "description": "Event not in favorites",
        "startDate": "2026-07-10",
        "endDate": "2026-07-12",
        "capacity": 30,
        "location": "Marseille",
        "category": "Art",
        "thumbnailUrl": "https://example.com/missing.jpg",
        "isFree": false
    }
    """;

        String eventResponse = mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String eventId = eventResponse.split("\"id\":")[1].split(",")[0].trim();

        mockMvc.perform(delete("/api/users/profile/like/" + eventId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void admin_can_delete_user_should_work() throws Exception {
        registerUser("Admin", "User", "admin.delete@test.com", "123456");
        User admin = userRepository.findByEmail("admin.delete@test.com").orElseThrow();
        admin.setRole("ADMIN");
        userRepository.save(admin);

        String adminToken = loginAndGetToken("admin.delete@test.com", "123456");

        registerUser("Target", "User", "target@test.com", "123456");
        User target = userRepository.findByEmail("target@test.com").orElseThrow();

        mockMvc.perform(delete("/api/users/" + target.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("User deleted by admin"));
    }

    @Test
    void get_user_by_id_should_work() throws Exception {
        String token = registerAndGetToken("Get", "ById", "getbyid@test.com", "123456");

        User user = userRepository.findByEmail("getbyid@test.com").orElseThrow();

        mockMvc.perform(get("/api/users/" + user.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("getbyid@test.com"))
                .andExpect(jsonPath("$.firstName").value("Get"))
                .andExpect(jsonPath("$.lastName").value("ById"));
    }

    @Test
    void update_user_by_id_should_work() throws Exception {
        String token = registerAndGetToken("Old", "Name", "updatebyid@test.com", "123456");

        User user = userRepository.findByEmail("updatebyid@test.com").orElseThrow();

        String updateJson = """
    {
        "firstName": "New",
        "lastName": "Updated"
    }
    """;

        mockMvc.perform(put("/api/users/" + user.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("New"))
                .andExpect(jsonPath("$.lastName").value("Updated"));
    }

    @Test
    void delete_user_by_admin_should_fail_when_current_user_is_not_admin() throws Exception {
        String normalToken = registerAndGetToken("Normal", "User", "normal.delete@test.com", "123456");

        registerUser("Target", "User", "target.nonadmin@test.com", "123456");
        User target = userRepository.findByEmail("target.nonadmin@test.com").orElseThrow();

        mockMvc.perform(delete("/api/users/" + target.getId())
                        .header("Authorization", "Bearer " + normalToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void delete_user_by_admin_should_fail_when_target_is_admin() throws Exception {
        registerUser("Admin", "One", "admin.one@test.com", "123456");
        User adminOne = userRepository.findByEmail("admin.one@test.com").orElseThrow();
        adminOne.setRole("ADMIN");
        userRepository.save(adminOne);

        String adminToken = loginAndGetToken("admin.one@test.com", "123456");

        registerUser("Admin", "Two", "admin.two@test.com", "123456");
        User adminTwo = userRepository.findByEmail("admin.two@test.com").orElseThrow();
        adminTwo.setRole("ADMIN");
        userRepository.save(adminTwo);

        mockMvc.perform(delete("/api/users/" + adminTwo.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Cannot delete another admin account"));
    }

    @Test
    void register_with_profile_picture_should_keep_it() throws Exception {
        String json = """
    {
        "firstName": "Pic",
        "lastName": "User",
        "email": "pic.user@test.com",
        "password": "123456",
        "profilePicture": "custom-picture"
    }
    """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("pic.user@test.com").orElseThrow();
        assertEquals("custom-picture", user.getProfilePicture());
    }

    @Test
    void update_profile_should_work_with_all_fields() throws Exception {
        String token = registerAndGetToken("Update", "User", "update.all@test.com", "123456");

        String updateJson = """
    {
        "firstName": "Updated",
        "lastName": "Name",
        "bio": "New bio",
        "location": "Lyon",
        "profilePicture": "5"
    }
    """;

        mockMvc.perform(put("/api/users/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"))
                .andExpect(jsonPath("$.bio").value("New bio"))
                .andExpect(jsonPath("$.location").value("Lyon"))
                .andExpect(jsonPath("$.profilePicture").value("5"));
    }

    @Test
    void get_my_events_should_return_past_events() throws Exception {
        String token = registerAndGetToken("Past", "User", "past.user@test.com", "123456");

        String eventJson = """
    {
        "title": "Past Event",
        "description": "Old event",
        "startDate": "2020-01-10",
        "endDate": "2020-01-12",
        "capacity": 100,
        "location": "Lyon",
        "category": "History",
        "thumbnailUrl": "https://example.com/past.jpg",
        "isFree": true
    }
    """;

        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventJson))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/users/profile/events")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pastEvents").isArray());
    }
}