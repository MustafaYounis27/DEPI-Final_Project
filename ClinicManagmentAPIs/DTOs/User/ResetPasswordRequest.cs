using System.ComponentModel.DataAnnotations;

namespace ClinicManagmentAPIs.DTOs.User;

public class ResetPasswordRequest
{
    [Required, StringLength(200, MinimumLength = 6)]
    public string new_password { get; set; } = string.Empty;
}
