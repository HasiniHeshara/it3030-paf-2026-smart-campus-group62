package backend.dto;

import backend.enumtype.IncidentTicketStatus;
import jakarta.validation.constraints.NotNull;

public class IncidentTicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private IncidentTicketStatus status;

    private String reason;

    private String resolutionNotes;

    public IncidentTicketStatusUpdateRequest() {
    }

    public IncidentTicketStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentTicketStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}