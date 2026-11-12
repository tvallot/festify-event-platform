package com.festify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.festify.models.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    /** All events sorted by date, then popularity (participant count), then free events first. */
    @Query("SELECT e FROM Event e " +
            "LEFT JOIN Participation p ON p.event.id = e.id " +
            "GROUP BY e.id " +
            "ORDER BY e.startDate ASC, COUNT(p.id) DESC, e.isFree DESC")
    List<Event> findAllDefaultSort();

    /** Removes the event from every user's favorites (native query on the join table). */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM favorites WHERE event_id = :eventId", nativeQuery = true)
    void deleteFavoritesByEventId(@Param("eventId") Long eventId);
}
