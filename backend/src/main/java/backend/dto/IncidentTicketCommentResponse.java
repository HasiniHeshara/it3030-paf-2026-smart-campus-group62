package backend.dto;

import java.time.LocalDateTime;

public class IncidentTicketCommentResponse {

    private Long id;
    private Long incidentTicketId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IncidentTicketCommentResponse() {
    }

    public IncidentTicketCommentResponse(Long id, Long incidentTicketId, Long authorId,
                                         String authorName, String authorRole, String content,
                                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.incidentTicketId = incidentTicketId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorRole = authorRole;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getIncidentTicketId() {
        return incidentTicketId;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getAuthorRole() {
        return authorRole;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}