package backend.dto;

public class UserManagementResponse {

    private Long id;
    private String fullName;
    private String year;
    private String faculty;
    private String itNumber;
    private String email;
    private String role;
    private String specialization;

    public UserManagementResponse() {
    }

    public UserManagementResponse(Long id, String fullName, String year, String faculty,
                                  String itNumber, String email, String role, String specialization) {
        this.id = id;
        this.fullName = fullName;
        this.year = year;
        this.faculty = faculty;
        this.itNumber = itNumber;
        this.email = email;
        this.role = role;
        this.specialization = specialization;
    }

    public Long getId() {
        return id;
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

    public String getRole() {
        return role;
    }

    public String getSpecialization() {
        return specialization;
    }
}