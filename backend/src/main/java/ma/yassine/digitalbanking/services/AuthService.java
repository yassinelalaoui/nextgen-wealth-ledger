package ma.yassine.digitalbanking.services;

import ma.yassine.digitalbanking.dtos.AuthResponse;
import ma.yassine.digitalbanking.dtos.ChangePasswordRequest;
import ma.yassine.digitalbanking.dtos.LoginRequest;
import ma.yassine.digitalbanking.dtos.RegisterRequest;
import org.springframework.security.core.Authentication;

public interface AuthService {

    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse authenticate(Authentication authentication);
    void changePassword(Long userId, ChangePasswordRequest request);
}
