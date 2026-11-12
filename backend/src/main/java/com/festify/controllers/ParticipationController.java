package com.festify.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.festify.exceptions.ResourceNotFoundException;
import com.festify.models.Event;
import com.festify.models.Participation;
import com.festify.models.User;
import com.festify.repositories.EventRepository;
import com.festify.repositories.ParticipationRepository;

@RestController
@RequestMapping("/api/events")
public class ParticipationController {

    private final EventRepository eventRepository;
    private final ParticipationRepository participationRepository;

    public ParticipationController(EventRepository eventRepository, ParticipationRepository participationRepository) {
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
    }

    /** Registers the current user to an event if there is still room. */
    @PostMapping("/{eventId}/join")
    public ResponseEntity<String> joinEvent(@PathVariable Long eventId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getCapacity() != null && participationRepository.countByEventId(eventId) >= event.getCapacity()) {
            return ResponseEntity.badRequest().body("Event full");
        }

        Participation participation = new Participation();
        participation.setEvent(event);
        participation.setUser(currentUser);
        participation.setCreator(false);
        participation.setOnWaitList(false);
        participation.setRegistrationDate(LocalDate.now());
        participationRepository.save(participation);

        return ResponseEntity.ok("Registration successful");
    }

    /** Unregisters the current user from an event. The creator cannot leave their own event. */
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

    @GetMapping("/{eventId}/participants")
    public List<Participation> getParticipants(@PathVariable Long eventId) {
        return participationRepository.findByEventId(eventId);
    }
}
