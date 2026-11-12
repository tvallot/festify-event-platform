package com.festify;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Tests pour les routes /api/events
// On vérifie que chaque route répond bien selon le rôle : public, user connecté, créateur ou admin
public class EventIntegrationTest extends BaseIntegrationTest {

    // JSON utilisé pour créer un événement de test
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

    // Méthode helper : crée un event et retourne son ID, utilisée dans plusieurs tests
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

    // Méthode helper : inscrit un admin et retourne son token
    private String registerAdminAndGetToken(String email) throws Exception {
        String adminJson = """
                {
                    "firstName": "Admin",
                    "lastName": "User",
                    "email": "%s",
                    "password": "123456",
                    "role": "ADMIN"
                }
                """.formatted(email);

        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(adminJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return extractToken(response);
    }

    // La liste des events est publique : n'importe qui peut y accéder sans compte
    @Test
    void get_all_events_should_be_public() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk());
    }

    // On vérifie que les filtres (catégorie, gratuit...) fonctionnent correctement
    @Test
    void get_events_with_filters_should_work() throws Exception {
        mockMvc.perform(get("/api/events")
                        .param("category", "Music")
                        .param("isFree", "true"))
                .andExpect(status().isOk());
    }

    // Sécurité : un utilisateur non connecté ne peut pas créer un event
    @Test
    void create_event_should_require_token() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EVENT_JSON))
                .andExpect(status().isForbidden());
    }

    // Un utilisateur connecté peut créer un event, on vérifie aussi que le titre est bien enregistré
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

    // Le créateur peut modifier son propre event, on vérifie que le nouveau titre est bien sauvegardé
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

    // Sécurité : un user ne peut pas modifier l'event d'un autre utilisateur
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

    // L'admin a des droits supérieurs : il peut modifier n'importe quel event
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

    // Le créateur peut supprimer son propre event
    @Test
    void delete_event_as_creator_should_succeed() throws Exception {
        String token = registerAndGetToken("Delete", "Creator", "delete.creator@test.com", "123456");
        String eventId = createEventAndGetId(token);

        mockMvc.perform(delete("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Event deleted successfully"));
    }

    // Sécurité : un user ne peut pas supprimer l'event d'un autre utilisateur
    @Test
    void delete_event_as_other_user_should_fail() throws Exception {
        String creatorToken = registerAndGetToken("Del", "Owner", "del.owner@test.com", "123456");
        String otherToken = registerAndGetToken("Other", "Deleter", "other.deleter@test.com", "123456");
        String eventId = createEventAndGetId(creatorToken);

        mockMvc.perform(delete("/api/events/" + eventId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    // L'admin peut supprimer n'importe quel event, même s'il n'en est pas le créateur
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

    // L'API doit répondre 404 proprement si l'event demandé n'existe pas
    @Test
    void delete_nonexistent_event_should_fail() throws Exception {
        String token = registerAndGetToken("Ghost", "Deleter", "ghost.deleter@test.com", "123456");

        mockMvc.perform(delete("/api/events/999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
