package backend.dto;

import backend.enumtype.BookingStatus;
import jakarta.validation.constraints.NotNull;

public class BookingStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String adminReason;

    public BookingStatusUpdateRequest() {
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getAdminReason() {
        return adminReason;
    }

    public void setAdminReason(String adminReason) {
        this.adminReason = adminReason;
    }
}