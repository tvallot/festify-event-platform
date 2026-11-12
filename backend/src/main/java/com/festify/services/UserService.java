package com.festify.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
public class UserService {

    private static final int AVATAR_COUNT = 6;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ParticipationRepository participationRepository;

    public UserService(UserRepository userRepository,
                       JwtService jwtService,
                       ParticipationRepository participationRepository) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.participationRepository = participationRepository;
    }

    /** Registers a new user: hashes the password, picks a default avatar and returns a JWT. */
    public LoginResponse registerUser(User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Email and password are required");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        user.setPasswordHash(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        user.setPassword(null);
        user.setRole("USER");

        if (user.getProfilePicture() == null) {
            int avatar = ThreadLocalRandom.current().nextInt(1, AVATAR_COUNT + 1);
            user.setProfilePicture(String.valueOf(avatar));
        }

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new LoginResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
    }

    /** Checks the credentials and returns a login response with a fresh JWT. */
    public LoginResponse loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (password == null || !BCrypt.checkpw(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /** Updates the profile fields that are present in the request. */
    public User updateUser(Long id, User details) {
        User user = getUserById(id);

        if (details.getFirstName() != null) user.setFirstName(details.getFirstName());
        if (details.getLastName() != null) user.setLastName(details.getLastName());
        if (details.getBio() != null) user.setBio(details.getBio());
        if (details.getLocation() != null) user.setLocation(details.getLocation());
        if (details.getProfilePicture() != null) user.setProfilePicture(details.getProfilePicture());

        return userRepository.save(user);
    }

    /** Groups the user's events into created, upcoming and past. */
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

    /** Deletes a user along with their participations and favorites. */
    @Transactional
    public void deleteUserAccount(Long userId) {
        User user = getUserById(userId);

        user.getFavorites().clear();
        userRepository.save(user);

        participationRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }
}
