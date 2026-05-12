using System.ComponentModel.DataAnnotations;
using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.DTOs.User;

public class CreateUserRequest
{
    [Required, StringLength(50)]
    public string username { get; set; } = string.Empty;

    [Required, StringLength(200, MinimumLength = 6)]
    public string password { get; set; } = string.Empty;

    [Required]
    public EmployeeType employee_type { get; set; }

    [EmailAddress, StringLength(200)]
    public string? email { get; set; }

    // Required only when employee_type == Doctor
    public CreateDoctorPart? doctor { get; set; }
}
