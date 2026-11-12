package com.festify.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.festify.dto.LoginRequest;
import com.festify.dto.LoginResponse;
import com.festify.dto.ProfileEventsResponse;
import com.festify.exceptions.ResourceNotFoundException;
import com.festify.models.Event;
import com.festify.models.User;
import com.festify.repositories.EventRepository;
import com.festify.repositories.UserRepository;
import com.festify.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final EventRepository eventRepository;

    public UserController(UserRepository userRepository,
                          UserService userService,
                          EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.eventRepository = eventRepository;
    }

    /** Lists every user (admin only, see SecurityConfig). */
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<LoginResponse> register(@RequestBody User user) {
        return new ResponseEntity<>(userService.registerUser(user), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.loginUser(request.getEmail(), request.getPassword()));
    }

    /** JWTs are stateless: the client simply discards its token. */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logout successful");
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /** Updates a profile. Users can only edit their own profile, admins can edit any. */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody User details,
                                        Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();

        if (!currentUser.getId().equals(id) && !isAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only update your own profile");
        }
        return ResponseEntity.ok(userService.updateUser(id, details));
    }

    /** Deletes a user account (admin only). Admin accounts cannot be deleted this way. */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        User target = userService.getUserById(id);

        if (isAdmin(target)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Cannot delete another admin account");
        }

        userService.deleteUserAccount(id);
        return ResponseEntity.ok("User deleted by admin");
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserById(currentUserId(authentication)));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateMyProfile(@RequestBody User details, Authentication authentication) {
        return ResponseEntity.ok(userService.updateUser(currentUserId(authentication), details));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<String> deleteMyAccount(Authentication authentication) {
        userService.deleteUserAccount(currentUserId(authentication));
        return ResponseEntity.ok("Account deleted successfully");
    }

    /** Returns the current user's events grouped as created / upcoming / past. */
    @GetMapping("/profile/events")
    public ResponseEntity<ProfileEventsResponse> getMyEvents(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfileEvents(currentUserId(authentication)));
    }

    @PostMapping("/profile/like/{eventId}")
    public ResponseEntity<String> addFavorite(@PathVariable Long eventId, Authentication authentication) {
        User user = userService.getUserById(currentUserId(authentication));
        Event event = findEvent(eventId);

        user.getFavorites().add(event);
        userRepository.save(user);

        return ResponseEntity.ok("Event added to favorites");
    }

    @DeleteMapping("/profile/like/{eventId}")
    public ResponseEntity<String> removeFavorite(@PathVariable Long eventId, Authentication authentication) {
        User user = userService.getUserById(currentUserId(authentication));
        Event event = findEvent(eventId);

        if (!user.getFavorites().remove(event)) {
            throw new ResourceNotFoundException("Favorite not found");
        }
        userRepository.save(user);

        return ResponseEntity.ok("Event removed from favorites");
    }

    private Event findEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    private static Long currentUserId(Authentication authentication) {
        return ((User) authentication.getPrincipal()).getId();
    }

    private static boolean isAdmin(User user) {
        return "ADMIN".equals(user.getRole());
    }
}
