package backend.service;

import backend.dto.CreateIncidentTicketRequest;
import backend.dto.IncidentTicketAttachmentResponse;
import backend.dto.IncidentTicketCommentResponse;
import backend.dto.IncidentTicketResponse;
import backend.entity.IncidentTicket;
import backend.entity.Resource;
import backend.entity.User;
import backend.enumtype.IncidentTicketStatus;
import backend.exception.ResourceNotFoundException;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository,
                                 ResourceRepository resourceRepository,
                                 UserRepository userRepository) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    public IncidentTicketResponse createIncidentTicket(CreateIncidentTicketRequest request, String reporterEmail) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        User reportedBy = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + reporterEmail));

        IncidentTicket incidentTicket = new IncidentTicket();
        incidentTicket.setResource(resource);
        incidentTicket.setLocation(request.getLocation());
        incidentTicket.setCategory(request.getCategory());
        incidentTicket.setDescription(request.getDescription());
        incidentTicket.setPriority(request.getPriority());
        incidentTicket.setPreferredContactName(request.getPreferredContactName());
        incidentTicket.setPreferredContactEmail(request.getPreferredContactEmail());
        incidentTicket.setPreferredContactPhone(request.getPreferredContactPhone());
        incidentTicket.setStatus(IncidentTicketStatus.OPEN);
        incidentTicket.setReportedBy(reportedBy);

        return mapToResponse(incidentTicketRepository.save(incidentTicket));
    }

    private IncidentTicketResponse mapToResponse(IncidentTicket incidentTicket) {
        Long assignedToId = incidentTicket.getAssignedTo() != null ? incidentTicket.getAssignedTo().getId() : null;
        String assignedToName = incidentTicket.getAssignedTo() != null ? incidentTicket.getAssignedTo().getFullName() : null;
        String assignedToEmail = incidentTicket.getAssignedTo() != null ? incidentTicket.getAssignedTo().getEmail() : null;

        return new IncidentTicketResponse(
                incidentTicket.getId(),
                incidentTicket.getResource().getId(),
                incidentTicket.getResource().getName(),
                incidentTicket.getLocation(),
                incidentTicket.getCategory(),
                incidentTicket.getDescription(),
                incidentTicket.getPriority(),
                incidentTicket.getPreferredContactName(),
                incidentTicket.getPreferredContactEmail(),
                incidentTicket.getPreferredContactPhone(),
                incidentTicket.getStatus(),
                incidentTicket.getRejectionReason(),
                incidentTicket.getResolutionNotes(),
                incidentTicket.getReportedBy().getId(),
                incidentTicket.getReportedBy().getFullName(),
                incidentTicket.getReportedBy().getEmail(),
                assignedToId,
                assignedToName,
                assignedToEmail,
                Collections.<IncidentTicketAttachmentResponse>emptyList(),
                Collections.<IncidentTicketCommentResponse>emptyList(),
                incidentTicket.getCreatedAt(),
                incidentTicket.getUpdatedAt()
        );
    }
}