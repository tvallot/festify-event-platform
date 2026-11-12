package com.festify.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.festify.exceptions.ResourceNotFoundException;
import com.festify.models.Event;
import com.festify.models.Participation;
import com.festify.models.User;
import com.festify.repositories.EventRepository;
import com.festify.repositories.ParticipationRepository;
import com.festify.specifications.EventSpecifications;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;
    private final ParticipationRepository participationRepository;

    public EventController(EventRepository eventRepository, ParticipationRepository participationRepository) {
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
    }

    /** Lists events, optionally filtered by keyword, category, price and location. */
    @GetMapping
    public List<Event> getEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isFree,
            @RequestParam(required = false) String region) {

        if (keyword == null && category == null && isFree == null && region == null) {
            return eventRepository.findAllDefaultSort();
        }

        Specification<Event> spec = Specification.where(EventSpecifications.hasKeyword(keyword))
                .and(EventSpecifications.hasCategory(category))
                .and(EventSpecifications.isFree(isFree))
                .and(EventSpecifications.inLocation(region));

        return eventRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "startDate"));
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return findEvent(id);
    }

    /** Creates an event and registers the current user as its creator. */
    @PostMapping
    @Transactional
    public ResponseEntity<Event> createEvent(@RequestBody Event event, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();

        event.setId(null);
        Event savedEvent = eventRepository.save(event);

        Participation participation = new Participation();
        participation.setUser(currentUser);
        participation.setEvent(savedEvent);
        participation.setCreator(true);
        participation.setOnWaitList(false);
        participation.setRegistrationDate(LocalDate.now());
        participationRepository.save(participation);

        return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
    }

    /** Updates an event (creator or admin only). */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id,
                                         @RequestBody Event details,
                                         Authentication authentication) {
        Event event = findEvent(id);

        if (!canManage((User) authentication.getPrincipal(), id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only the creator or an admin can update this event");
        }

        if (details.getTitle() != null) event.setTitle(details.getTitle());
        if (details.getDescription() != null) event.setDescription(details.getDescription());
        if (details.getStartDate() != null) event.setStartDate(details.getStartDate());
        if (details.getEndDate() != null) event.setEndDate(details.getEndDate());
        if (details.getLocation() != null) event.setLocation(details.getLocation());
        if (details.getCategory() != null) event.setCategory(details.getCategory());
        if (details.getIsFree() != null) event.setIsFree(details.getIsFree());
        if (details.getCapacity() != null) event.setCapacity(details.getCapacity());
        if (details.getThumbnailUrl() != null) event.setThumbnailUrl(details.getThumbnailUrl());

        return ResponseEntity.ok(eventRepository.save(event));
    }

    /** Deletes an event with its participations and favorites (creator or admin only). */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<String> deleteEvent(@PathVariable Long id, Authentication authentication) {
        Event event = findEvent(id);

        if (!canManage((User) authentication.getPrincipal(), id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only the creator or an admin can delete this event");
        }

        eventRepository.deleteFavoritesByEventId(id);
        participationRepository.deleteByEventId(id);
        eventRepository.delete(event);

        return ResponseEntity.ok("Event deleted successfully");
    }

    private Event findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    private boolean canManage(User user, Long eventId) {
        if ("ADMIN".equals(user.getRole())) {
            return true;
        }
        return participationRepository.findByUserIdAndEventId(user.getId(), eventId)
                .map(p -> Boolean.TRUE.equals(p.getCreator()))
                .orElse(false);
    }
}
