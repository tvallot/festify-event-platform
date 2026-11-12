package com.festify.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.festify.dto.LoginResponse;
import com.festify.dto.ProfileEventsResponse;
import com.festify.exceptions.InvalidCredentialsException;
import com.festify.exceptions.ResourceNotFoundException;
import com.festify.exceptions.UserAlreadyExistsException;
import com.festify.models.Event;
import com.festify.models.Participation;
import com.festify.models.User;
import com.festify.repositories.ParticipationRepository;
import com.festify.repositories.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ParticipationRepository participationRepository;

    /** Gère l'inscription : hash du mot de passe, avatar par défaut et génération du JWT. */
    public LoginResponse registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already exists"); 
        }

        user.setPasswordHash(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        
        if (user.getProfilePicture() == null) {
            int randomNumber = ThreadLocalRandom.current().nextInt(1, 7);
            user.setProfilePicture(String.valueOf(randomNumber));
        }

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new LoginResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    /** Recherche un utilisateur par son identifiant. */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with the id : " + id)); 
    }

    /** Met à jour les champs renseignés du profil utilisateur. */
    public User updateUser(Long id, User details) {
        User user = getUserById(id);

        if (details.getFirstName() != null) user.setFirstName(details.getFirstName());

        if (details.getLastName() != null) user.setLastName(details.getLastName());

        if (details.getBio() != null) user.setBio(details.getBio());

        if (details.getLocation() != null) user.setLocation(details.getLocation());

        if (details.getProfilePicture() != null) user.setProfilePicture(details.getProfilePicture());

        return userRepository.save(user);
    }

    /** Vérifie les identifiants et génère un token JWT en cas de succès. */
    public String loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!BCrypt.checkpw(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return jwtService.generateToken(user);
    }

    /** Regroupe les événements d'un utilisateur par statut (créés, à venir, passés). */
    public ProfileEventsResponse getProfileEvents(Long userId) {
        List<Participation> participations = participationRepository.findByUserId(userId);

        List<Event> createdEvents = new ArrayList<>();
        List<Event> upcomingEvents = new ArrayList<>();
        List<Event> pastEvents = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (Participation participation : participations) {
            Event event = participation.getEvent();

            if (Boolean.TRUE.equals(participation.getCreator())) {
                createdEvents.add(event);
            }

            if (event.getStartDate() != null) {
                if (event.getStartDate().isBefore(today)) {
                    pastEvents.add(event);
                } else {
                    upcomingEvents.add(event);
                }
            }
        }

        return new ProfileEventsResponse(createdEvents, upcomingEvents, pastEvents);
    }

    /** Supprime le compte utilisateur, ses participations et purge ses favoris. */
    @Transactional
    public void deleteUserAccount(Long userId) {
        User user = getUserById(userId);

        user.getFavorites().clear();
        userRepository.save(user);

        participationRepository.deleteByUserId(userId);

        userRepository.delete(user);
    }

}
