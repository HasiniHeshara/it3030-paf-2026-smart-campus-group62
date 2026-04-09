package backend.service;

import backend.dto.UserManagementResponse;
import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
                        user.getRole().name()
                ))
                .toList();
    }

    public String deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);
        return "User deleted successfully";
    }
}