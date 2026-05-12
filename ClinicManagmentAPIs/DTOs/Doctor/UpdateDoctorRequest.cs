using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.DTOs.Doctor;
public class UpdateDoctorRequest
{
    [Required, StringLength(100)] public string first_name { get; set; } = string.Empty;
    [Required, StringLength(100)] public string last_name { get; set; } = string.Empty;
    [Required] public int specialty_id { get; set; }
    [StringLength(30)] public string? phone { get; set; }
    [EmailAddress, StringLength(200)] public string? email { get; set; }
    [Required] public bool active_flag { get; set; }
}
