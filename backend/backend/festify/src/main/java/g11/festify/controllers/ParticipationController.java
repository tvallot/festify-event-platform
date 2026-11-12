package g11.festify.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import g11.festify.exceptions.ResourceNotFoundException;
import g11.festify.models.Event;
import g11.festify.models.Participation;
import g11.festify.models.User;
import g11.festify.repositories.EventRepository;
import g11.festify.repositories.ParticipationRepository;

@RestController
@RequestMapping("/api/events")
public class ParticipationController {

    private final EventRepository eventRepository;
    private final ParticipationRepository participationRepository;

    public ParticipationController(EventRepository eventRepository, ParticipationRepository participationRepository) {
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
    }

    /** Inscrit l'utilisateur connecté à un événement s'il reste de la place. */
    @PostMapping("/{eventId}/join")
    public ResponseEntity<String> joinEvent(@PathVariable Long eventId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

	if (event.getCapacity() != null && participationRepository.countByEventId(eventId) >= event.getCapacity()) {
            return ResponseEntity.badRequest().body("Event full");
        }

        Participation p = new Participation();
        p.setEvent(event);
        p.setUser(currentUser);
        participationRepository.save(p);

        return ResponseEntity.ok("Registration successful");
    }

    /** Désinscrit l'utilisateur connecté d'un événement (impossible pour le créateur). */
    @DeleteMapping("/{eventId}/join")
    public ResponseEntity<String> leaveEvent(@PathVariable Long eventId, Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        Participation participation = participationRepository
                .findByUserIdAndEventId(currentUser.getId(), eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found"));

        if (Boolean.TRUE.equals(participation.getCreator())) {
            return ResponseEntity.badRequest().body("Creator cannot leave their own event");
        }

        participationRepository.delete(participation);

        return ResponseEntity.ok("Left event successfully");
    }

    /** Liste tous les participants d'un événement donné. */
    @GetMapping("/{eventId}/participants")
    public List<Participation> getParticipants(@PathVariable Long eventId) {
        return participationRepository.findByEventId(eventId);
    }
}
