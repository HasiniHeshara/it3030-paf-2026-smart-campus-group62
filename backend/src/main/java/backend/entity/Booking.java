package backend.entity;

import backend.enumtype.BookingStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 300)
    private String purpose;

    @Column(nullable = false)
    private Integer expectedAttendees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(length = 300)
    private String adminReason;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Booking() {
    }

    public Booking(Long id, Resource resource, String userEmail, LocalDate bookingDate,
                   LocalTime startTime, LocalTime endTime, String purpose,
                   Integer expectedAttendees, BookingStatus status,
                   String adminReason, LocalDateTime createdAt) {
        this.id = id;
        this.resource = resource;
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

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.PENDING;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}