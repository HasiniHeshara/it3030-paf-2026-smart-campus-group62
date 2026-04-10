package backend.service;

import backend.dto.AuthResponse;
import backend.dto.LoginRequest;
import backend.dto.RegisterRequest;
import backend.dto.UpdateProfileRequest;
import backend.entity.User;
import backend.repository.UserRepository;
import backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        if (userRepository.existsByItNumber(request.getItNumber())) {
            throw new RuntimeException("IT number is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setYear(request.getYear());
        user.setFaculty(request.getFaculty());
        user.setItNumber(request.getItNumber());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return buildAuthResponse(savedUser, token, "Registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        if ("admin@sliit.lk".equals(request.getEmail()) && "Admin@123".equals(request.getPassword())) {
            String token = jwtService.generateToken("admin@sliit.lk", "ADMIN");

            return new AuthResponse(
                    0L,
                    "System Admin",
                    "Admin",
                    "Administration",
                    "ADMIN000",
                    "admin@sliit.lk",
                    "ADMIN",
                    token,
                    "Admin login successful"
            );
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        boolean passwordMatches;
        try {
            passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, token, "Login successful");
    }

    public AuthResponse getCurrentUser(String email) {
        if ("admin@sliit.lk".equals(email)) {
            return new AuthResponse(
                    0L,
                    "System Admin",
                    "Admin",
                    "Administration",
                    "ADMIN000",
                    "admin@sliit.lk",
                    "ADMIN",
                    null,
                    "Admin fetched successfully"
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildAuthResponse(user, null, "User fetched successfully");
    }

    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        if ("admin@sliit.lk".equals(currentEmail)) {
            throw new RuntimeException("Hardcoded admin profile cannot be edited here");
        }

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmail() != null &&
                !request.getEmail().equalsIgnoreCase(user.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        if (request.getItNumber() != null &&
                !request.getItNumber().equalsIgnoreCase(user.getItNumber()) &&
                userRepository.existsByItNumber(request.getItNumber())) {
            throw new RuntimeException("IT number is already registered");
        }

        user.setFullName(request.getFullName());
        user.setItNumber(request.getItNumber());
        user.setFaculty(request.getFaculty());
        user.setYear(request.getYear());
        user.setEmail(request.getEmail());

        User updatedUser = userRepository.save(user);
        return buildAuthResponse(updatedUser, null, "Profile updated successfully");
    }

    private AuthResponse buildAuthResponse(User user, String token, String message) {
        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getYear(),
                user.getFaculty(),
                user.getItNumber(),
                user.getEmail(),
                user.getRole().name(),
                token,
                message
        );
    }
}