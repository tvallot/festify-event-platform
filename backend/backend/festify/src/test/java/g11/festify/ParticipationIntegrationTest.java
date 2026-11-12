package g11.festify;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Tests pour les routes de participation aux events (join/leave/participants)
// On vérifie les règles : capacité max, droits du créateur, accès public
public class ParticipationIntegrationTest extends BaseIntegrationTest {

    // JSON pour créer un event normal avec une grande capacité
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

    // JSON pour créer un event avec capacité = 1 (sera plein dès la création car le créateur compte)
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

    // Méthode helper : crée un event et retourne son ID
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

    // Un utilisateur connecté peut rejoindre un event : on crée un user, un event, puis on rejoint
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

    // Sécurité : sans token, on ne peut pas s'inscrire à un event
    @Test
    void join_event_without_token_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "NoToken", "creator.notoken@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(post("/api/events/" + eventId + "/join"))
                .andExpect(status().isForbidden());
    }

    // La capacité max doit être respectée : le créateur compte déjà comme 1, capacité = 1 donc plein
    @Test
    void join_full_event_should_fail() throws Exception {
        // Le créateur compte déjà comme 1 participant, capacité = 1 donc plein
        String creatorToken = registerAndGetToken("Creator", "Full", "creator.full@test.com", "123456");
        String joinerToken = registerAndGetToken("Joiner", "Full", "joiner.full@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, FULL_EVENT_JSON);

        mockMvc.perform(post("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + joinerToken))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Event full"));
    }

    // On rejoint d'abord l'event, puis on le quitte : les deux actions doivent fonctionner
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

    // Règle métier : le créateur est lié à son event, il ne peut pas le quitter
    @Test
    void creator_cannot_leave_event() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "Cannot", "creator.cannot@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(delete("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + creatorToken))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Creator cannot leave their own event"));
    }

    // On ne peut pas quitter un event auquel on n'est pas inscrit : l'API doit retourner 404
    @Test
    void leave_event_not_joined_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "NotJoined", "creator.notjoined@test.com", "123456");
        String otherToken = registerAndGetToken("Other", "NotJoined", "other.notjoined@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(delete("/api/events/" + eventId + "/join")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isNotFound());
    }

    // La liste des participants est publique : accessible sans être connecté
    @Test
    void get_participants_should_be_public() throws Exception {
        String creatorToken = registerAndGetToken("Creator", "Public", "creator.public@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken, EVENT_JSON);

        mockMvc.perform(get("/api/events/" + eventId + "/participants"))
                .andExpect(status().isOk());
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
