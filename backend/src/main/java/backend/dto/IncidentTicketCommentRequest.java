package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IncidentTicketCommentRequest {

    @NotNull(message = "Incident ticket id is required")
    private Long incidentTicketId;

    @NotBlank(message = "Comment content is required")
    private String content;

    public IncidentTicketCommentRequest() {
    }

    public Long getIncidentTicketId() {
        return incidentTicketId;
    }

    public void setIncidentTicketId(Long incidentTicketId) {
        this.incidentTicketId = incidentTicketId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}