using System.ComponentModel.DataAnnotations;

namespace ClinicManagmentAPIs.DTOs.Auth;

public class LoginRequest
{
    [Required, StringLength(50)]
    public string username { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string password { get; set; } = string.Empty;
}
