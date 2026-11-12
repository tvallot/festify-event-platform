package g11.festify.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import g11.festify.models.Event;
import jakarta.transaction.Transactional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    /** Liste les événements triés par date, popularité, puis gratuité. */
    @Query("SELECT e FROM Event e " +
            "LEFT JOIN Participation p ON p.event.id = e.id " +
            "GROUP BY e.id " +
            "ORDER BY e.startDate ASC, COUNT(p.id) DESC, e.isFree DESC")
    List<Event> findAllDefaultSort();

    /** Recherche les événements contenant le mot-clé dans leur titre. */
    List<Event> findByTitleContainingIgnoreCase(String keyword);

    /** Filtre les événements par catégorie. */
    List<Event> findByCategory(String category);

    /** Filtre les événements payants ou gratuits. */
    List<Event> findByIsFree(Boolean isFree);

    /** Recherche les événements dans une région ou ville donnée. */
    List<Event> findByLocationContaining(String region);

    /** Liste les événements strictement à venir, triés par date. */
    List<Event> findByStartDateAfterOrderByStartDateAsc(LocalDate date);

    /** Supprime toutes les mises en favoris d'un événement spécifique. */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM favorites WHERE event_id = :eventId", nativeQuery = true)
    void deleteFavoritesByEventId(@Param("eventId") Long eventId);
}
