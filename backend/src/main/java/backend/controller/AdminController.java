package backend.controller;

import backend.dto.CreateTechnicianRequest;
import backend.dto.UserManagementResponse;
import backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserManagementResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/technicians")
    public ResponseEntity<UserManagementResponse> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        return ResponseEntity.ok(adminService.createTechnician(request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", adminService.deleteUser(id)));
    }
}