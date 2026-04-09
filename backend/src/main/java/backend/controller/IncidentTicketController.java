package backend.controller;

import backend.dto.CreateIncidentTicketRequest;
import backend.dto.IncidentTicketResponse;
import backend.service.IncidentTicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/{id}/attachments", consumes = "multipart/form-data")
    public ResponseEntity<IncidentTicketResponse> addAttachments(
            @PathVariable Long id,
            @RequestPart("files") MultipartFile[] files
    ) {
        return ResponseEntity.ok(incidentTicketService.addAttachments(id, files));
    }
}