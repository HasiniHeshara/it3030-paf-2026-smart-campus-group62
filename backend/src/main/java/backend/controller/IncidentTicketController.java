package backend.controller;

import backend.dto.CreateIncidentTicketRequest;
import backend.dto.IncidentTicketAssignmentRequest;
import backend.dto.IncidentTicketCommentRequest;
import backend.dto.IncidentTicketStatusUpdateRequest;
import backend.dto.IncidentTicketResponse;
import backend.enumtype.IncidentTicketStatus;
import backend.service.IncidentTicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

            @GetMapping("/{id}")
            public ResponseEntity<IncidentTicketResponse> getIncidentTicketById(
                @PathVariable Long id,
                Authentication authentication
            ) {
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

            return ResponseEntity.ok(
                incidentTicketService.getIncidentTicketById(id, authentication.getName(), isAdmin)
            );
            }

            @GetMapping("/my")
            public ResponseEntity<List<IncidentTicketResponse>> getMyReportedTickets(Authentication authentication) {
            return ResponseEntity.ok(incidentTicketService.getMyReportedTickets(authentication.getName()));
            }

            @GetMapping("/assigned")
            public ResponseEntity<List<IncidentTicketResponse>> getAssignedTickets(Authentication authentication) {
            return ResponseEntity.ok(incidentTicketService.getAssignedTickets(authentication.getName()));
            }

            @GetMapping
            public ResponseEntity<List<IncidentTicketResponse>> getAllTickets(
                Authentication authentication,
                @RequestParam(required = false) IncidentTicketStatus status
            ) {
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

            return ResponseEntity.ok(incidentTicketService.getAllTickets(status, isAdmin));
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

    @PostMapping("/{id}/comments")
    public ResponseEntity<IncidentTicketResponse> addComment(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody IncidentTicketCommentRequest request
    ) {
        return ResponseEntity.ok(incidentTicketService.addComment(id, request, authentication.getName()));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<IncidentTicketResponse> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Authentication authentication,
            @Valid @RequestBody IncidentTicketCommentRequest request
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        return ResponseEntity.ok(
                incidentTicketService.updateComment(ticketId, commentId, request, authentication.getName(), isAdmin)
        );
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        incidentTicketService.deleteComment(ticketId, commentId, authentication.getName(), isAdmin);
        return ResponseEntity.ok("Comment deleted successfully");
    }

    @PostMapping(value = "/{id}/attachments", consumes = "multipart/form-data")
    public ResponseEntity<IncidentTicketResponse> addAttachments(
            @PathVariable Long id,
            @RequestPart("files") MultipartFile[] files
    ) {
        return ResponseEntity.ok(incidentTicketService.addAttachments(id, files));
    }
}