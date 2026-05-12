using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.Appointment;
public class AppointmentResponse
{
    public int appointment_id { get; set; }
    public int patient_id { get; set; }
    public string patient_name { get; set; } = string.Empty;
    public int doctor_id { get; set; }
    public string doctor_name { get; set; } = string.Empty;
    public DateTime scheduled_at { get; set; }
    public AppointmentType appointment_type { get; set; }
    public AppointmentStatus status { get; set; }
    public string? reason { get; set; }
    public DateTime created_at { get; set; }
}
