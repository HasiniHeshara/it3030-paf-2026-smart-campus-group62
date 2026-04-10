package backend.dto;

public class UpdateProfileRequest {

    private String fullName;
    private String year;
    private String faculty;
    private String itNumber;
    private String email;

    public UpdateProfileRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public String getYear() {
        return year;
    }

    public String getFaculty() {
        return faculty;
    }

    public String getItNumber() {
        return itNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public void setItNumber(String itNumber) {
        this.itNumber = itNumber;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}