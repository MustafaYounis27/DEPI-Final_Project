using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.DTOs.Patient;
public class UpdatePatientRequest
{
    [Required, StringLength(50)] public string mrn { get; set; } = string.Empty;
    [Required, StringLength(100)] public string first_name { get; set; } = string.Empty;
    [Required, StringLength(100)] public string last_name { get; set; } = string.Empty;
    [Required] public DateOnly date_of_birth { get; set; }
    [Required, RegularExpression("^(Male|Female|Other)$")] public string sex { get; set; } = string.Empty;
    [StringLength(30)] public string? phone { get; set; }
    [EmailAddress, StringLength(200)] public string? email { get; set; }
    [StringLength(500)] public string? address { get; set; }
}
