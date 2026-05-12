namespace ClinicManagmentAPIs.DTOs.Doctor;
public class DoctorResponse
{
    public int doctor_id { get; set; }
    public string first_name { get; set; } = string.Empty;
    public string last_name { get; set; } = string.Empty;
    public int specialty_id { get; set; }
    public string specialty_name { get; set; } = string.Empty;
    public string? phone { get; set; }
    public string? email { get; set; }
    public bool active_flag { get; set; }
}
