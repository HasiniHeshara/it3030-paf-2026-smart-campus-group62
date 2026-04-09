package backend.service;

import backend.dto.AuthResponse;
import backend.dto.LoginRequest;
import backend.dto.RegisterRequest;
import backend.entity.User;
import backend.repository.UserRepository;
import backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
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