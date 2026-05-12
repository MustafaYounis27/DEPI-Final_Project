using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.Appointment;
public class UpdateAppointmentRequest
{
    // Any non-null field is treated as a change.
    public int? doctor_id { get; set; }
    public DateTime? scheduled_at { get; set; }
    public AppointmentType? appointment_type { get; set; }
    public AppointmentStatus? status { get; set; }
    public string? reason { get; set; }
}
