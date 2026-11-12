package com.festify.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.festify.models.Participation;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    int countByEventId(Long eventId);

    List<Participation> findByEventId(Long eventId);

    List<Participation> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    Optional<Participation> findByUserIdAndEventId(Long userId, Long eventId);

    @Modifying
    @Transactional
    void deleteByEventId(Long eventId);

}
