package backend.service;

import backend.dto.CreateIncidentTicketRequest;
import backend.dto.IncidentTicketAttachmentResponse;
import backend.dto.IncidentTicketCommentResponse;
import backend.dto.IncidentTicketResponse;
import backend.dto.IncidentTicketStatusUpdateRequest;
import backend.entity.IncidentTicketAttachment;
import backend.entity.IncidentTicket;
import backend.entity.Resource;
import backend.entity.User;
import backend.enumtype.IncidentTicketStatus;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.IncidentTicketAttachmentRepository;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
import backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final IncidentTicketAttachmentRepository incidentTicketAttachmentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository,
                                 IncidentTicketAttachmentRepository incidentTicketAttachmentRepository,
                                 ResourceRepository resourceRepository,
                                 UserRepository userRepository) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.incidentTicketAttachmentRepository = incidentTicketAttachmentRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
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

    @Transactional
    public IncidentTicketResponse updateIncidentTicketStatus(Long incidentTicketId,
                                                             IncidentTicketStatusUpdateRequest request,
                                                             boolean isAdmin) {
        if (!isAdmin) {
            throw new AccessDeniedException("Only admin can update incident ticket status");
        }

        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        validateStatusTransition(incidentTicket.getStatus(), request.getStatus(), request.getReason());

        incidentTicket.setStatus(request.getStatus());

        if (request.getStatus() == IncidentTicketStatus.REJECTED) {
            incidentTicket.setRejectionReason(request.getReason());
            incidentTicket.setResolutionNotes(null);
        } else {
            incidentTicket.setRejectionReason(null);
            if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
                incidentTicket.setResolutionNotes(request.getResolutionNotes());
            }
        }

        return mapToResponse(incidentTicketRepository.save(incidentTicket));
    }

    @Transactional
    public IncidentTicketResponse addAttachments(Long incidentTicketId, MultipartFile[] files) {
        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        if (files == null || files.length == 0) {
            throw new BadRequestException("At least one image attachment is required");
        }

        long existingCount = incidentTicketAttachmentRepository.countByIncidentTicketId(incidentTicketId);
        if (existingCount + files.length > 3) {
            throw new BadRequestException("A ticket can have at most 3 image attachments");
        }

        List<IncidentTicketAttachment> attachmentsToSave = new ArrayList<>();
        for (MultipartFile file : files) {
            validateImageAttachment(file);

            IncidentTicketAttachment attachment = new IncidentTicketAttachment();
            attachment.setIncidentTicket(incidentTicket);
            attachment.setOriginalFileName(file.getOriginalFilename());
            attachment.setContentType(file.getContentType());

            try {
                attachment.setImageData(file.getBytes());
            } catch (IOException ex) {
                throw new BadRequestException("Failed to read attachment: " + file.getOriginalFilename());
            }

            attachment.setFileSize(file.getSize());
            attachmentsToSave.add(attachment);
        }

        incidentTicketAttachmentRepository.saveAll(attachmentsToSave);
        incidentTicketRepository.save(incidentTicket);

        return mapToResponse(incidentTicket);
    }

    private IncidentTicketResponse mapToResponse(IncidentTicket incidentTicket) {
        List<IncidentTicketAttachmentResponse> attachmentResponses = incidentTicketAttachmentRepository
                .findByIncidentTicketIdOrderByUploadedAtAsc(incidentTicket.getId())
                .stream()
                .map(this::mapToAttachmentResponse)
                .toList();

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
                attachmentResponses,
                Collections.<IncidentTicketCommentResponse>emptyList(),
                incidentTicket.getCreatedAt(),
                incidentTicket.getUpdatedAt()
        );
    }

    private IncidentTicketAttachmentResponse mapToAttachmentResponse(IncidentTicketAttachment attachment) {
        return new IncidentTicketAttachmentResponse(
                attachment.getId(),
                attachment.getIncidentTicket().getId(),
                attachment.getOriginalFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getUploadedAt()
        );
    }

    private void validateImageAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Attachment file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Only image attachments are allowed");
        }

        if (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()) {
            throw new BadRequestException("Attachment file name is required");
        }
    }

    private void validateStatusTransition(IncidentTicketStatus currentStatus,
                                          IncidentTicketStatus targetStatus,
                                          String reason) {
        if (currentStatus == null || targetStatus == null) {
            throw new BadRequestException("Status is required");
        }

        boolean validTransition = switch (currentStatus) {
            case OPEN -> targetStatus == IncidentTicketStatus.IN_PROGRESS || targetStatus == IncidentTicketStatus.REJECTED;
            case IN_PROGRESS -> targetStatus == IncidentTicketStatus.RESOLVED || targetStatus == IncidentTicketStatus.REJECTED;
            case RESOLVED -> targetStatus == IncidentTicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!validTransition) {
            throw new BadRequestException("Invalid ticket status transition from " + currentStatus + " to " + targetStatus);
        }

        if (targetStatus == IncidentTicketStatus.REJECTED && (reason == null || reason.isBlank())) {
            throw new BadRequestException("Reason is required when rejecting a ticket");
        }

        if (targetStatus != IncidentTicketStatus.REJECTED && reason != null && !reason.isBlank()) {
            throw new BadRequestException("Reason is only allowed when rejecting a ticket");
        }
    }
}