package g11.festify.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import g11.festify.dto.LoginRequest;
import g11.festify.dto.LoginResponse;
import g11.festify.dto.ProfileEventsResponse;
import g11.festify.exceptions.ResourceNotFoundException;
import g11.festify.models.Event;
import g11.festify.models.User;
import g11.festify.repositories.EventRepository;
import g11.festify.repositories.UserRepository;
import g11.festify.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;
    @Autowired
    private EventRepository eventRepository;

    /** Liste tous les utilisateurs (réservé aux administrateurs). */
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Inscrit un nouvel utilisateur. */
    @PostMapping
    public ResponseEntity<LoginResponse> register(@RequestBody User user) {
        LoginResponse response = userService.registerUser(user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /** Authentifie un utilisateur et retourne un token JWT. */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String token = userService.loginUser(request.getEmail(), request.getPassword());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    /** Supprime le compte d'un utilisateur (réservé aux administrateurs). */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserByAdmin(@PathVariable Long id) {
        User targetUser = userService.getUserById(id);

        if ("ADMIN".equals(targetUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Cannot delete another admin account");
        }

        userService.deleteUserAccount(id);
        return ResponseEntity.ok("User deleted by admin");
    }

    /** Affiche le profil public d'un utilisateur spécifique. */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /** Met à jour le profil d'un utilisateur spécifique. */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User userDetails) {
        return ResponseEntity.ok(userService.updateUser(id, userDetails));
    }

    /** Affiche le profil de l'utilisateur actuellement connecté. */
    @GetMapping("/profile")
    public ResponseEntity<User> getMyProfile(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    /** Met à jour le profil de l'utilisateur actuellement connecté. */
    @PutMapping("/profile")
    public ResponseEntity<User> updateMyProfile(@RequestBody User userDetails, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.updateUser(currentUser.getId(), userDetails));
    }

    /** Ajoute un événement aux favoris de l'utilisateur. */
    @PostMapping("/profile/like/{eventId}")
    public ResponseEntity<String> likeEvent(@PathVariable Long eventId, Authentication authentication) {
        User authUser = (User) authentication.getPrincipal();
        User currentUser = userService.getUserById(authUser.getId());
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        currentUser.getFavorites().add(event);
        userRepository.save(currentUser);

        return ResponseEntity.ok("Event added to favorites");
    }

    /** Retire un événement des favoris de l'utilisateur. */
    @DeleteMapping("/profile/like/{eventId}")
    public ResponseEntity<String> removeFavorite(@PathVariable Long eventId, Authentication authentication) {
        User authUser = (User) authentication.getPrincipal();
        User currentUser = userService.getUserById(authUser.getId());

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!currentUser.getFavorites().contains(event)) {
            throw new ResourceNotFoundException("Favorite not found");
        }

        currentUser.getFavorites().remove(event);
        userRepository.save(currentUser);

        return ResponseEntity.ok("Event removed from favorites");
    }

    /** Supprime le compte de l'utilisateur connecté et toutes ses données. */
    @DeleteMapping("/profile")
    public ResponseEntity<String> deleteMyAccount(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        userService.deleteUserAccount(currentUser.getId());
        return ResponseEntity.ok("Account deleted successfully");
    }

    /** Déconnecte l'utilisateur. */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logout successful");
    }

    /** Liste les événements (créés, passés, à venir) de l'utilisateur connecté. */
    @GetMapping("/profile/events")
    public ResponseEntity<ProfileEventsResponse> getMyEvents(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getProfileEvents(currentUser.getId()));
    }
}