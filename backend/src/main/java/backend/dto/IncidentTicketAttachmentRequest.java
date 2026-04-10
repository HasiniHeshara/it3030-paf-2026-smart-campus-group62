package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IncidentTicketAttachmentRequest {

    @NotNull(message = "Incident ticket id is required")
    private Long incidentTicketId;

    @NotBlank(message = "File name is required")
    private String originalFileName;

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotNull(message = "Image data is required")
    private byte[] imageData;

    public IncidentTicketAttachmentRequest() {
    }

    public Long getIncidentTicketId() {
        return incidentTicketId;
    }

    public void setIncidentTicketId(Long incidentTicketId) {
        this.incidentTicketId = incidentTicketId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }
}