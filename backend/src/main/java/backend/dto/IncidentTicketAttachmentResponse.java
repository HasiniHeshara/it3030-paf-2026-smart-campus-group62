package backend.dto;

import java.time.LocalDateTime;

public class IncidentTicketAttachmentResponse {

    private Long id;
    private Long incidentTicketId;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    public IncidentTicketAttachmentResponse() {
    }

    public IncidentTicketAttachmentResponse(Long id, Long incidentTicketId, String originalFileName,
                                            String contentType, Long fileSize, LocalDateTime uploadedAt) {
        this.id = id;
        this.incidentTicketId = incidentTicketId;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getIncidentTicketId() {
        return incidentTicketId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}