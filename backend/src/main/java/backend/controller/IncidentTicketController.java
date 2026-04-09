package backend.controller;

import backend.dto.CreateIncidentTicketRequest;
import backend.dto.IncidentTicketAssignmentRequest;
import backend.dto.IncidentTicketStatusUpdateRequest;
import backend.dto.IncidentTicketResponse;
import backend.service.IncidentTicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;

@RestController
@RequestMapping("/api/incident-tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    public IncidentTicketController(IncidentTicketService incidentTicketService) {
        this.incidentTicketService = incidentTicketService;
    }

    @PostMapping
    public ResponseEntity<IncidentTicketResponse> createIncidentTicket(
            Authentication authentication,
            @Valid @RequestBody CreateIncidentTicketRequest request
    ) {
        return new ResponseEntity<>(
                incidentTicketService.createIncidentTicket(request, authentication.getName()),
                HttpStatus.CREATED
        );
    }

        @PatchMapping("/{id}/status")
        public ResponseEntity<IncidentTicketResponse> updateIncidentTicketStatus(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody IncidentTicketStatusUpdateRequest request
        ) {
            boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

            if (isAdmin) {
                return ResponseEntity.ok(incidentTicketService.updateIncidentTicketStatus(id, request, true));
            }

            return ResponseEntity.ok(incidentTicketService.updateAssignedTicketStatus(id, request, authentication.getName()));
            }

            @PutMapping("/{id}/assign")
            public ResponseEntity<IncidentTicketResponse> assignIncidentTicket(
                @PathVariable Long id,
                Authentication authentication,
                @Valid @RequestBody IncidentTicketAssignmentRequest request
            ) {
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

            return ResponseEntity.ok(incidentTicketService.assignIncidentTicket(id, request, isAdmin));
        }

    @PostMapping(value = "/{id}/attachments", consumes = "multipart/form-data")
    public ResponseEntity<IncidentTicketResponse> addAttachments(
            @PathVariable Long id,
            @RequestPart("files") MultipartFile[] files
    ) {
        return ResponseEntity.ok(incidentTicketService.addAttachments(id, files));
    }
}