package com.festify;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Integration tests for /api/events
// Each route is checked against the caller role: anonymous, user, event creator or admin
public class EventIntegrationTest extends BaseIntegrationTest {

    private static final String EVENT_JSON = """
            {
                "title": "Test Event",
                "description": "A test event",
                "startDate": "2026-06-01",
                "endDate": "2026-06-03",
                "capacity": 100,
                "location": "Paris",
                "category": "Music",
                "thumbnailUrl": "https://example.com/event.jpg",
                "isFree": true
            }
            """;

    private String createEventAndGetId(String token) throws Exception {
        String response = mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EVENT_JSON))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return response.split("\"id\":")[1].split(",")[0].trim();
    }

    @Test
    void get_event_by_id_should_be_public() throws Exception {
        String token = registerAndGetToken("Get", "Event", "get.event@test.com", "123456");
        String eventId = createEventAndGetId(token);
        flushAndClear();

        mockMvc.perform(get("/api/events/" + eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Event"))
                .andExpect(jsonPath("$.participantCount").value(1));
    }

    @Test
    void get_unknown_event_should_return_404() throws Exception {
        mockMvc.perform(get("/api/events/999999"))
                .andExpect(status().isNotFound());
    }

    // The event list is public
    @Test
    void get_all_events_should_be_public() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk());
    }

    @Test
    void get_events_with_filters_should_work() throws Exception {
        mockMvc.perform(get("/api/events")
                        .param("category", "Music")
                        .param("isFree", "true"))
                .andExpect(status().isOk());
    }

    @Test
    void create_event_should_require_token() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EVENT_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void create_event_should_work_with_token() throws Exception {
        String token = registerAndGetToken("Create", "Event", "create.event@test.com", "123456");

        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EVENT_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Event"));
    }

    @Test
    void update_event_as_creator_should_succeed() throws Exception {
        String token = registerAndGetToken("Update", "Creator", "update.creator@test.com", "123456");
        String eventId = createEventAndGetId(token);

        String updateJson = """
                { "title": "Updated Title" }
                """;

        mockMvc.perform(put("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    @Test
    void update_event_as_other_user_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Event", "Owner", "event.owner.upd@test.com", "123456");
        String otherToken = registerAndGetToken("Other", "User", "other.user.upd@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken);

        String updateJson = """
                { "title": "Hacked Title" }
                """;

        mockMvc.perform(put("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void update_event_as_admin_should_succeed() throws Exception {
        String creatorToken = registerAndGetToken("Event", "Creator2", "event.creator2@test.com", "123456");
        String adminToken = registerAdminAndGetToken("admin.update@test.com");
        String eventId = createEventAndGetId(creatorToken);

        String updateJson = """
                { "title": "Admin Updated Title" }
                """;

        mockMvc.perform(put("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Admin Updated Title"));
    }

    @Test
    void delete_event_as_creator_should_succeed() throws Exception {
        String token = registerAndGetToken("Delete", "Creator", "delete.creator@test.com", "123456");
        String eventId = createEventAndGetId(token);

        mockMvc.perform(delete("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Event deleted successfully"));
    }

    @Test
    void delete_event_as_other_user_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Del", "Owner", "del.owner@test.com", "123456");
        String otherToken = registerAndGetToken("Other", "Deleter", "other.deleter@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken);

        mockMvc.perform(delete("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void delete_event_as_admin_should_succeed() throws Exception {
        String creatorToken = registerAndGetToken("Event", "ForAdmin", "event.foradmin@test.com", "123456");
        String adminToken = registerAdminAndGetToken("admin.delete@test.com");
        String eventId = createEventAndGetId(creatorToken);

        mockMvc.perform(delete("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Event deleted successfully"));
    }

    @Test
    void delete_nonexistent_event_should_fail() throws Exception {
        String token = registerAndGetToken("Ghost", "Deleter", "ghost.deleter@test.com", "123456");

        mockMvc.perform(delete("/api/events/999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
