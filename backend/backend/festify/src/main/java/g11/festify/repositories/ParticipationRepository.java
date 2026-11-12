package g11.festify.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import g11.festify.models.Participation;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    /** Compte le nombre de participants à un événement. */
    int countByEventId(Long eventId);

    /** Liste toutes les participations pour un événement. */
    List<Participation> findByEventId(Long eventId);

    /** Liste toutes les participations d'un utilisateur. */
    List<Participation> findByUserId(Long userId);

    /** Supprime toutes les participations liées à un utilisateur. */
    void deleteByUserId(Long userId);

    /** Vérifie la participation d'un utilisateur à un événement précis. */
    Optional<Participation> findByUserIdAndEventId(Long userId, Long eventId);

    /** Supprime toutes les participations liées à un événement. */
    @Modifying
    @Transactional
    void deleteByEventId(Long eventId);

}
