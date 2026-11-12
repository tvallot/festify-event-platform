package com.festify;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Integration tests for joining and leaving events
// Covers capacity limits, creator rules and public access to the participant list
public class ParticipationIntegrationTest extends BaseIntegrationTest {

    private static final String EVENT_JSON = """
            {
                "title": "Participation Event",
                "description": "Event for participation tests",
                "startDate": "2026-07-01",
                "endDate": "2026-07-03",
                "capacity": 100,
                "location": "Lyon",
                "category": "Sport",
                "thumbnailUrl": "https://example.com/event.jpg",
                "isFree": true
            }
            """;

    // Capacity 1: the event is already full because the creator counts as a participant
    private static final String FULL_EVENT_JSON = """
            {
                "title": "Full Event",
                "description": "Event with capacity 1",
                "startDate": "2026-07-01",
                "endDate": "2026-07-03",
                "capacity": 1,
                "location": "Lyon",
                "category": "Sport",
                "thumbnailUrl": "https://example.com/event.jpg",
                "isFree": true
            }
            """;


    private static final String EVENT_WITH_NULL_CAPACITY_JSON = """
        {
            "title": "Unlimited Event",
            "description": "Event without capacity",
            "startDate": "2026-08-01",
            "endDate": "2026-08-03",
            "capacity": null,
            "location": "Lyon",
            "category": "Sport",
            "thumbnailUrl": "https://example.com/event.jpg",
            "isFree": true
        }
        """;

    private String createEventAndGetId(String token, String eventJson) throws Exception {
        String response = mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return response.split("\"id\":")[1].split(",")[0].trim();
    }

    @Test
    void join_event_should_work_with_token() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "Join", "creator.join@test.com", "123456");
        String joinerToken = registerAndGetToken("Joiner", "User", "joiner.user@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(post("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Registration successful"));
    }

    @Test
    void join_event_without_token_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "NoToken", "creator.notoken@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(post("/api/events/" + eventId + "/join"))
                .andExpect(status().isForbidden());
    }

    @Test
    void join_full_event_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "Full", "creator.full@test.com", "123456");
        String joinerToken = registerAndGetToken("Joiner", "Full", "joiner.full@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, FULL_EVENT_JSON);

        mockMvc.perform(post("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Event full"));
    }

    @Test
    void leave_event_should_work() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "Leave", "creator.leave@test.com", "123456");
        String joinerToken = registerAndGetToken("Joiner", "Leave", "joiner.leave@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(post("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Left event successfully"));
    }

    @Test
    void creator_cannot_leave_event() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "Cannot", "creator.cannot@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(delete("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + creatorToken))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Creator cannot leave their own event"));
    }

    @Test
    void leave_event_not_joined_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "NotJoined", "creator.notjoined@test.com", "123456");
        String otherToken = registerAndGetToken("Other", "NotJoined", "other.notjoined@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(delete("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void get_participants_should_be_public() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "Public", "creator.public@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(get("/api/events/" + eventId + "/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].user.firstName").value("Creator"))
                .andExpect(jsonPath("$[0].user.email").doesNotExist())
                .andExpect(jsonPath("$[0].user.passwordHash").doesNotExist());
    }

    @Test
    void join_event_with_null_capacity_should_work() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "NullCap", "creator.nullcap@test.com", "123456");
        String joinerToken = registerAndGetToken("Joiner", "NullCap", "joiner.nullcap@test.com", "123456");

        String eventId = createEventAndGetId(creatorToken, EVENT_WITH_NULL_CAPACITY_JSON);

        mockMvc.perform(post("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Registration successful"));
    }
}
