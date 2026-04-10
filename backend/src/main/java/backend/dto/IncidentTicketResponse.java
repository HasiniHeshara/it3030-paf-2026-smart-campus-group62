package backend.dto;

import backend.enumtype.IncidentTicketPriority;
import backend.enumtype.IncidentTicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public class IncidentTicketResponse {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String location;
    private String category;
    private String description;
    private IncidentTicketPriority priority;
    private String preferredContactName;
    private String preferredContactEmail;
    private String preferredContactPhone;
    private IncidentTicketStatus status;
    private String rejectionReason;
    private String resolutionNotes;
    private Long reportedByUserId;
    private String reportedByName;
    private String reportedByEmail;
    private Long assignedToUserId;
    private String assignedToName;
    private String assignedToEmail;
    private List<IncidentTicketAttachmentResponse> attachments;
    private List<IncidentTicketCommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IncidentTicketResponse() {
    }

    public IncidentTicketResponse(Long id, Long resourceId, String resourceName, String location,
                                  String category, String description, IncidentTicketPriority priority,
                                  String preferredContactName, String preferredContactEmail,
                                  String preferredContactPhone, IncidentTicketStatus status,
                                  String rejectionReason, String resolutionNotes,
                                  Long reportedByUserId, String reportedByName, String reportedByEmail,
                                  Long assignedToUserId, String assignedToName, String assignedToEmail,
                                  List<IncidentTicketAttachmentResponse> attachments,
                                  List<IncidentTicketCommentResponse> comments,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.location = location;
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.preferredContactName = preferredContactName;
        this.preferredContactEmail = preferredContactEmail;
        this.preferredContactPhone = preferredContactPhone;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.resolutionNotes = resolutionNotes;
        this.reportedByUserId = reportedByUserId;
        this.reportedByName = reportedByName;
        this.reportedByEmail = reportedByEmail;
        this.assignedToUserId = assignedToUserId;
        this.assignedToName = assignedToName;
        this.assignedToEmail = assignedToEmail;
        this.attachments = attachments;
        this.comments = comments;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getLocation() {
        return location;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public IncidentTicketPriority getPriority() {
        return priority;
    }

    public String getPreferredContactName() {
        return preferredContactName;
    }

    public String getPreferredContactEmail() {
        return preferredContactEmail;
    }

    public String getPreferredContactPhone() {
        return preferredContactPhone;
    }

    public IncidentTicketStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public Long getReportedByUserId() {
        return reportedByUserId;
    }

    public String getReportedByName() {
        return reportedByName;
    }

    public String getReportedByEmail() {
        return reportedByEmail;
    }

    public Long getAssignedToUserId() {
        return assignedToUserId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public List<IncidentTicketAttachmentResponse> getAttachments() {
        return attachments;
    }

    public List<IncidentTicketCommentResponse> getComments() {
        return comments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}