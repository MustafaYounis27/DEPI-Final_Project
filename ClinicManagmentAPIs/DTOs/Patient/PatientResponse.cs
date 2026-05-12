namespace ClinicManagmentAPIs.DTOs.Patient;
public class PatientResponse
{
    public int patient_id { get; set; }
    public string mrn { get; set; } = string.Empty;
    public string first_name { get; set; } = string.Empty;
    public string last_name { get; set; } = string.Empty;
    public DateOnly date_of_birth { get; set; }
    public string sex { get; set; } = string.Empty;
    public string? phone { get; set; }
    public string? email { get; set; }
    public string? address { get; set; }
    public DateTime created_at { get; set; }
}
