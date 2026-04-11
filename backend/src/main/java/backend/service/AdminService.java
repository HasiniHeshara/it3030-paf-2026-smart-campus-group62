package backend.service;

import backend.dto.CreateTechnicianRequest;
import backend.dto.UserManagementResponse;
import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserManagementResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserManagementResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getYear(),
                        user.getFaculty(),
                        user.getItNumber(),
                        user.getEmail(),
                        user.getRole().name(),
                        resolveSpecialization(user)
                ))
                .toList();
    }

    public String deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);
        return "User deleted successfully";
    }

    public UserManagementResponse createTechnician(CreateTechnicianRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered");
        }

        String specialization = request.getSpecialization();
        if (!List.of("NETWORK", "HARDWARE", "SOFTWARE", "ELECTRICAL").contains(specialization)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid specialization selected");
        }

        String experienceLevel = request.getExperienceLevel();
        if (!List.of("BEGINNER", "INTERMEDIATE", "EXPERT").contains(experienceLevel)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid experience level selected");
        }

        String generatedItNumber = generateTechnicianItNumber(request.getEmail());

        User technician = new User();
        technician.setFullName(request.getFullName());
        technician.setYear(experienceLevel);
        technician.setFaculty(specialization);
        technician.setItNumber(generatedItNumber);
        technician.setEmail(request.getEmail());
        technician.setPassword(passwordEncoder.encode(request.getPassword()));
        technician.setPhoneNumber(request.getPhoneNumber());
        technician.setSpecialization(specialization);
        technician.setExperienceLevel(experienceLevel);
        technician.setRole(User.Role.TECHNICIAN);

        User savedTechnician = userRepository.save(technician);
        return new UserManagementResponse(
                savedTechnician.getId(),
                savedTechnician.getFullName(),
                savedTechnician.getYear(),
                savedTechnician.getFaculty(),
                savedTechnician.getItNumber(),
                savedTechnician.getEmail(),
                savedTechnician.getRole().name(),
                resolveSpecialization(savedTechnician)
        );
    }

    private String resolveSpecialization(User user) {
        if (user.getSpecialization() != null && !user.getSpecialization().isBlank()) {
            return user.getSpecialization();
        }

        // Backward compatibility: older technician records stored specialization in faculty.
        if (user.getRole() == User.Role.TECHNICIAN && user.getFaculty() != null && !user.getFaculty().isBlank()) {
            return user.getFaculty();
        }

        return null;
    }

    private String generateTechnicianItNumber(String email) {
        String base = email == null ? "TECH" : email.split("@")[0].toUpperCase().replaceAll("[^A-Z0-9]", "");
        if (base.isBlank()) {
            base = "TECH";
        }

        String candidate = "TECH-" + base;
        int suffix = 1;
        while (userRepository.existsByItNumber(candidate)) {
            candidate = "TECH-" + base + "-" + suffix;
            suffix++;
        }

        return candidate;
    }
}