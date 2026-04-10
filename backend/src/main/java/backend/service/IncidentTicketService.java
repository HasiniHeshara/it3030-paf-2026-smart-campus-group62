package backend.service;

import backend.dto.CreateIncidentTicketRequest;
import backend.dto.IncidentTicketAttachmentResponse;
import backend.dto.IncidentTicketCommentRequest;
import backend.dto.IncidentTicketCommentResponse;
import backend.dto.IncidentTicketAssignmentRequest;
import backend.dto.IncidentTicketResponse;
import backend.dto.IncidentTicketStatusUpdateRequest;
import backend.entity.IncidentTicketAttachment;
import backend.entity.IncidentTicketComment;
import backend.entity.IncidentTicket;
import backend.entity.Notification;
import backend.entity.Resource;
import backend.entity.User;
import backend.enumtype.IncidentTicketStatus;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.IncidentTicketAttachmentRepository;
import backend.repository.IncidentTicketCommentRepository;
import backend.repository.IncidentTicketRepository;
import backend.repository.ResourceRepository;
import backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class IncidentTicketService {

    private static final long MAX_ATTACHMENT_SIZE_BYTES = 10L * 1024L * 1024L;

    private final IncidentTicketRepository incidentTicketRepository;
    private final IncidentTicketAttachmentRepository incidentTicketAttachmentRepository;
    private final IncidentTicketCommentRepository incidentTicketCommentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository,
                                 IncidentTicketAttachmentRepository incidentTicketAttachmentRepository,
                                 IncidentTicketCommentRepository incidentTicketCommentRepository,
                                 ResourceRepository resourceRepository,
                                 UserRepository userRepository,
                                 NotificationService notificationService) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.incidentTicketAttachmentRepository = incidentTicketAttachmentRepository;
        this.incidentTicketCommentRepository = incidentTicketCommentRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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

    @Transactional(readOnly = true)
    public IncidentTicketResponse getIncidentTicketById(Long incidentTicketId, String userEmail, boolean isAdmin) {
        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        if (!isAdmin && !canAccessTicket(incidentTicket, userEmail)) {
            throw new AccessDeniedException("You do not have access to this incident ticket");
        }

        return mapToResponse(incidentTicket);
    }

    @Transactional(readOnly = true)
    public List<IncidentTicketResponse> getMyReportedTickets(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return incidentTicketRepository.findByReportedByIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentTicketResponse> getAssignedTickets(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return incidentTicketRepository.findByAssignedToIdOrderByUpdatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentTicketResponse> getAllTickets(IncidentTicketStatus status, boolean isAdmin) {
        if (!isAdmin) {
            throw new AccessDeniedException("Only admin can view all incident tickets");
        }

        List<IncidentTicket> tickets = status == null
                ? incidentTicketRepository.findAllByOrderByUpdatedAtDesc()
                : incidentTicketRepository.findByStatusOrderByUpdatedAtDesc(status);

        return tickets.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public IncidentTicketResponse updateIncidentTicketStatus(Long incidentTicketId,
                                                             IncidentTicketStatusUpdateRequest request,
                                                             boolean isAdmin) {
        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        validateStatusTransition(incidentTicket, request.getStatus(), request.getReason(), request.getResolutionNotes(), isAdmin);

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

        IncidentTicket savedTicket = incidentTicketRepository.save(incidentTicket);
        notifyTicketStatusChange(savedTicket);
        return mapToResponse(savedTicket);
    }

    @Transactional
    public IncidentTicketResponse assignIncidentTicket(Long incidentTicketId,
                                                       IncidentTicketAssignmentRequest request,
                                                       boolean isAdmin) {
        if (!isAdmin) {
            throw new AccessDeniedException("Only admin can assign incident tickets");
        }

        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        User assignee = userRepository.findById(request.getAssigneeUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getAssigneeUserId()));

        if (assignee.getRole() != User.Role.ADMIN && assignee.getRole() != User.Role.TECHNICIAN) {
            throw new BadRequestException("Only admin or technician users can be assigned to tickets");
        }

        incidentTicket.setAssignedTo(assignee);

        IncidentTicket savedTicket = incidentTicketRepository.save(incidentTicket);

        notificationService.createSystemNotification(
                assignee.getEmail(),
                "Ticket Assigned",
                "You have been assigned to incident ticket #" + savedTicket.getId() + " for resource " + savedTicket.getResource().getName() + ".",
                Notification.Type.TICKET
        );

        return mapToResponse(savedTicket);
    }

    @Transactional
    public IncidentTicketResponse updateAssignedTicketStatus(Long incidentTicketId,
                                                             IncidentTicketStatusUpdateRequest request,
                                                             String userEmail) {
        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (incidentTicket.getAssignedTo() == null || !incidentTicket.getAssignedTo().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the assigned user can update this ticket");
        }

        validateAssignedUserTransition(incidentTicket.getStatus(), request.getStatus(), request.getResolutionNotes());

        incidentTicket.setStatus(request.getStatus());
        incidentTicket.setRejectionReason(null);

        if (request.getStatus() == IncidentTicketStatus.RESOLVED) {
            incidentTicket.setResolutionNotes(request.getResolutionNotes());
        }

        IncidentTicket savedTicket = incidentTicketRepository.save(incidentTicket);
        notifyTicketStatusChange(savedTicket);
        return mapToResponse(savedTicket);
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

    @Transactional
    public IncidentTicketResponse addComment(Long incidentTicketId,
                                             IncidentTicketCommentRequest request,
                                             String userEmail) {
        if (!incidentTicketId.equals(request.getIncidentTicketId())) {
            throw new BadRequestException("Ticket id in path and request body must match");
        }

        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        IncidentTicketComment comment = new IncidentTicketComment();
        comment.setIncidentTicket(incidentTicket);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        incidentTicketCommentRepository.save(comment);
        notifyCommentAdded(incidentTicket, author, request.getContent());

        return mapToResponse(incidentTicket);
    }

    @Transactional
    public IncidentTicketResponse updateComment(Long incidentTicketId,
                                                Long commentId,
                                                IncidentTicketCommentRequest request,
                                                String userEmail,
                                                boolean isAdmin) {
        if (!incidentTicketId.equals(request.getIncidentTicketId())) {
            throw new BadRequestException("Ticket id in path and request body must match");
        }

        IncidentTicket incidentTicket = incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        IncidentTicketComment comment = incidentTicketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getIncidentTicket().getId().equals(incidentTicketId)) {
            throw new BadRequestException("Comment does not belong to the selected ticket");
        }

        if (!isAdmin && !comment.getAuthor().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        incidentTicketCommentRepository.save(comment);

        return mapToResponse(incidentTicket);
    }

    @Transactional
    public void deleteComment(Long incidentTicketId,
                              Long commentId,
                              String userEmail,
                              boolean isAdmin) {
        incidentTicketRepository.findById(incidentTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id: " + incidentTicketId));

        IncidentTicketComment comment = incidentTicketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getIncidentTicket().getId().equals(incidentTicketId)) {
            throw new BadRequestException("Comment does not belong to the selected ticket");
        }

        if (!isAdmin && !comment.getAuthor().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        incidentTicketCommentRepository.delete(comment);
    }

    private void notifyTicketStatusChange(IncidentTicket ticket) {
        String reporterEmail = ticket.getReportedBy().getEmail();
        String resourceName = ticket.getResource().getName();
        String message;

        switch (ticket.getStatus()) {
            case IN_PROGRESS ->
                    message = "Your incident ticket #" + ticket.getId() + " for " + resourceName + " is now IN_PROGRESS.";
            case RESOLVED ->
                    message = "Your incident ticket #" + ticket.getId() + " for " + resourceName + " has been RESOLVED.";
            case CLOSED ->
                    message = "Your incident ticket #" + ticket.getId() + " for " + resourceName + " has been CLOSED.";
            case REJECTED -> {
                String reason = ticket.getRejectionReason() != null && !ticket.getRejectionReason().isBlank()
                        ? " Reason: " + ticket.getRejectionReason()
                        : "";
                message = "Your incident ticket #" + ticket.getId() + " for " + resourceName + " was REJECTED." + reason;
            }
            default -> {
                return;
            }
        }

        notificationService.createSystemNotification(
                reporterEmail,
                "Ticket Status Updated",
                message,
                Notification.Type.TICKET
        );
    }

    private void notifyCommentAdded(IncidentTicket ticket, User author, String commentContent) {
        String trimmedContent = commentContent == null ? "" : commentContent.trim();
        String preview = trimmedContent.length() > 80
                ? trimmedContent.substring(0, 80) + "..."
                : trimmedContent;

        User reporter = ticket.getReportedBy();
        User assignee = ticket.getAssignedTo();

        if (reporter != null && !reporter.getEmail().equalsIgnoreCase(author.getEmail())) {
            notificationService.createSystemNotification(
                    reporter.getEmail(),
                    "New Comment on Your Ticket",
                    author.getFullName() + " added a new comment on ticket #" + ticket.getId() + ": " + preview,
                    Notification.Type.COMMENT
            );
        }

        if (assignee != null
                && !assignee.getEmail().equalsIgnoreCase(author.getEmail())
                && (reporter == null || !assignee.getEmail().equalsIgnoreCase(reporter.getEmail()))) {
            notificationService.createSystemNotification(
                    assignee.getEmail(),
                    "New Comment on Assigned Ticket",
                    author.getFullName() + " added a new comment on ticket #" + ticket.getId() + ": " + preview,
                    Notification.Type.COMMENT
            );
        }
    }

    private IncidentTicketResponse mapToResponse(IncidentTicket incidentTicket) {
        List<IncidentTicketAttachmentResponse> attachmentResponses = incidentTicketAttachmentRepository
                .findByIncidentTicketIdOrderByUploadedAtAsc(incidentTicket.getId())
                .stream()
                .map(this::mapToAttachmentResponse)
                .toList();

        List<IncidentTicketCommentResponse> commentResponses = incidentTicketCommentRepository
                .findByIncidentTicketIdOrderByCreatedAtAsc(incidentTicket.getId())
                .stream()
                .map(this::mapToCommentResponse)
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
                commentResponses,
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

    private IncidentTicketCommentResponse mapToCommentResponse(IncidentTicketComment comment) {
        return new IncidentTicketCommentResponse(
                comment.getId(),
                comment.getIncidentTicket().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.getAuthor().getRole().name(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

    private void validateImageAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Attachment file cannot be empty");
        }

        if (file.getSize() > MAX_ATTACHMENT_SIZE_BYTES) {
            throw new BadRequestException("Each attachment must be 10MB or smaller");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Only image attachments are allowed");
        }

        if (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()) {
            throw new BadRequestException("Attachment file name is required");
        }
    }

    private void validateStatusTransition(IncidentTicket incidentTicket,
                                          IncidentTicketStatus targetStatus,
                                          String reason,
                                          String resolutionNotes,
                                          boolean isAdmin) {
        IncidentTicketStatus currentStatus = incidentTicket.getStatus();

        if (currentStatus == null || targetStatus == null) {
            throw new BadRequestException("Status is required");
        }

        boolean validTransition;
        if (isAdmin) {
            validTransition = switch (currentStatus) {
                case OPEN -> targetStatus == IncidentTicketStatus.IN_PROGRESS || targetStatus == IncidentTicketStatus.REJECTED;
                case IN_PROGRESS -> targetStatus == IncidentTicketStatus.RESOLVED || targetStatus == IncidentTicketStatus.REJECTED;
                case RESOLVED -> targetStatus == IncidentTicketStatus.CLOSED;
                case CLOSED, REJECTED -> false;
            };
        } else {
            validTransition = switch (currentStatus) {
                case OPEN -> targetStatus == IncidentTicketStatus.IN_PROGRESS;
                case IN_PROGRESS -> targetStatus == IncidentTicketStatus.RESOLVED;
                case RESOLVED, CLOSED, REJECTED -> false;
            };
        }

        if (!validTransition) {
            throw new BadRequestException("Invalid ticket status transition from " + currentStatus + " to " + targetStatus);
        }

        if (isAdmin) {
            if (targetStatus == IncidentTicketStatus.REJECTED && (reason == null || reason.isBlank())) {
                throw new BadRequestException("Reason is required when rejecting a ticket");
            }

            if (targetStatus != IncidentTicketStatus.REJECTED && reason != null && !reason.isBlank()) {
                throw new BadRequestException("Reason is only allowed when rejecting a ticket");
            }
        }

        if (!isAdmin && resolutionNotes != null && !resolutionNotes.isBlank() && targetStatus != IncidentTicketStatus.RESOLVED) {
            throw new BadRequestException("Resolution notes can only be added when resolving a ticket");
        }

        if (!isAdmin && targetStatus == IncidentTicketStatus.RESOLVED && (resolutionNotes == null || resolutionNotes.isBlank())) {
            throw new BadRequestException("Resolution notes are required when resolving a ticket");
        }
    }

    private void validateAssignedUserTransition(IncidentTicketStatus currentStatus,
                                                IncidentTicketStatus targetStatus,
                                                String resolutionNotes) {
        if (currentStatus == null || targetStatus == null) {
            throw new BadRequestException("Status is required");
        }

        boolean validTransition = switch (currentStatus) {
            case OPEN -> targetStatus == IncidentTicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> targetStatus == IncidentTicketStatus.RESOLVED;
            case RESOLVED, CLOSED, REJECTED -> false;
        };

        if (!validTransition) {
            throw new BadRequestException("Invalid ticket status transition from " + currentStatus + " to " + targetStatus);
        }

        if (targetStatus == IncidentTicketStatus.RESOLVED && (resolutionNotes == null || resolutionNotes.isBlank())) {
            throw new BadRequestException("Resolution notes are required when resolving a ticket");
        }
    }

    private boolean canAccessTicket(IncidentTicket incidentTicket, String userEmail) {
        if (incidentTicket.getReportedBy() != null && incidentTicket.getReportedBy().getEmail().equalsIgnoreCase(userEmail)) {
            return true;
        }

        return incidentTicket.getAssignedTo() != null
                && incidentTicket.getAssignedTo().getEmail().equalsIgnoreCase(userEmail);
    }
}