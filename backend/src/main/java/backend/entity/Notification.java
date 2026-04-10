package backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    public enum Type {
        BOOKING,
        TICKET,
        COMMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipientEmail;

    private String title;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private Type type;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Long getId() { return id; }
    public String getRecipientEmail() { return recipientEmail; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public Type getType() { return type; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public void setTitle(String title) { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setType(Type type) { this.type = type; }
    public void setRead(boolean read) { isRead = read; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}