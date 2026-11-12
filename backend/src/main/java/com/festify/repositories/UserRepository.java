package com.festify.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.festify.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /** Recherche un utilisateur spécifique via son adresse email. */
    Optional<User> findByEmail(String email);
}