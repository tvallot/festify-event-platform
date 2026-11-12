package g11.festify.dto;

import g11.festify.models.Event;

import java.util.List;

public class ProfileEventsResponse {
    private List<Event> createdEvents;
    private List<Event> upcomingEvents;
    private List<Event> pastEvents;

    public ProfileEventsResponse(List<Event> createdEvents, List<Event> upcomingEvents, List<Event> pastEvents) {
        this.createdEvents = createdEvents;
        this.upcomingEvents = upcomingEvents;
        this.pastEvents = pastEvents;
    }

    public List<Event> getCreatedEvents() {
        return createdEvents;
    }

    public List<Event> getUpcomingEvents() {
        return upcomingEvents;
    }

    public List<Event> getPastEvents() {
        return pastEvents;
    }
}