package backend.dto;

public class CreateNotificationRequest {
    private String recipientEmail;
    private String title;
    private String message;
    private String type;

    public CreateNotificationRequest() {}

    public String getRecipientEmail() { return recipientEmail; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }

    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public void setTitle(String title) { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setType(String type) { this.type = type; }
}