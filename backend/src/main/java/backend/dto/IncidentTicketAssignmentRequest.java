package backend.dto;

import jakarta.validation.constraints.NotNull;

public class IncidentTicketAssignmentRequest {

    @NotNull(message = "Assignee user id is required")
    private Long assigneeUserId;

    public IncidentTicketAssignmentRequest() {
    }

    public Long getAssigneeUserId() {
        return assigneeUserId;
    }

    public void setAssigneeUserId(Long assigneeUserId) {
        this.assigneeUserId = assigneeUserId;
    }
}