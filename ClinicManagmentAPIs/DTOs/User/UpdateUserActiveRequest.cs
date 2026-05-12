using System.ComponentModel.DataAnnotations;

namespace ClinicManagmentAPIs.DTOs.User;

public class UpdateUserActiveRequest
{
    [Required]
    public bool active_flag { get; set; }
}
