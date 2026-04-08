package backend.dto;

import backend.enumtype.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingResponse {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private String userEmail;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminReason;
    private LocalDateTime createdAt;

    public BookingResponse() {
    }

    public BookingResponse(Long id, Long resourceId, String resourceName, String resourceType,
                           String userEmail, LocalDate bookingDate, LocalTime startTime,
                           LocalTime endTime, String purpose, Integer expectedAttendees,
                           BookingStatus status, String adminReason, LocalDateTime createdAt) {
        this.id = id;
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.resourceType = resourceType;
        this.userEmail = userEmail;
        this.bookingDate = bookingDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.status = status;
        this.adminReason = adminReason;
        this.createdAt = createdAt;
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

    public String getResourceType() {
        return resourceType;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public String getAdminReason() {
        return adminReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}