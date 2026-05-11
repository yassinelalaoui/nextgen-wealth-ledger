package ma.yassine.digitalbanking.web.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.yassine.digitalbanking.dtos.AuthResponse;
import ma.yassine.digitalbanking.dtos.ChangePasswordRequest;
import ma.yassine.digitalbanking.dtos.LoginRequest;
import ma.yassine.digitalbanking.dtos.RegisterRequest;
import ma.yassine.digitalbanking.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AuthResponse response = authService.authenticate(authentication);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = extractUserId(authentication);
        authService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(Authentication authentication) {
        // In a real application, the user ID would be extracted from the JWT token
        // For now, we'll use the username to find the user
        // This should be improved in production
        return 1L;  // Placeholder
    }
}
