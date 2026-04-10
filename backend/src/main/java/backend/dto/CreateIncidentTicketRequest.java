package backend.dto;

import backend.enumtype.IncidentTicketPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateIncidentTicketRequest {

    @NotNull(message = "Resource id is required")
    private Long resourceId;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private IncidentTicketPriority priority;

    private String preferredContactName;

    @Email(message = "Enter a valid contact email")
    private String preferredContactEmail;

    private String preferredContactPhone;

    public CreateIncidentTicketRequest() {
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IncidentTicketPriority getPriority() {
        return priority;
    }

    public void setPriority(IncidentTicketPriority priority) {
        this.priority = priority;
    }

    public String getPreferredContactName() {
        return preferredContactName;
    }

    public void setPreferredContactName(String preferredContactName) {
        this.preferredContactName = preferredContactName;
    }

    public String getPreferredContactEmail() {
        return preferredContactEmail;
    }

    public void setPreferredContactEmail(String preferredContactEmail) {
        this.preferredContactEmail = preferredContactEmail;
    }

    public String getPreferredContactPhone() {
        return preferredContactPhone;
    }

    public void setPreferredContactPhone(String preferredContactPhone) {
        this.preferredContactPhone = preferredContactPhone;
    }
}