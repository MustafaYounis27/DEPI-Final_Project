using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.DTOs.PatientHistory;
public class CreatePatientHistoryRequest
{
    [Required] public int appointment_id { get; set; }
    [Required, StringLength(1000)] public string diagnosis { get; set; } = string.Empty;
    [StringLength(4000)] public string? notes { get; set; }
    [StringLength(2000)] public string? prescription { get; set; }
}
