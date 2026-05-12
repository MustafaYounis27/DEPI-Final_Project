using System.ComponentModel.DataAnnotations;
using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.Appointment;
public class CreateAppointmentRequest
{
    [Required] public int patient_id { get; set; }
    [Required] public int doctor_id { get; set; }
    [Required] public DateTime scheduled_at { get; set; }
    [Required] public AppointmentType appointment_type { get; set; }
    [StringLength(500)] public string? reason { get; set; }
}
