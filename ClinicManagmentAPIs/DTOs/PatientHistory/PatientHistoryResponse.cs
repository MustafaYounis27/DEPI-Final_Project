namespace ClinicManagmentAPIs.DTOs.PatientHistory;
public class PatientHistoryResponse
{
    public int history_id { get; set; }
    public int patient_id { get; set; }
    public int doctor_id { get; set; }
    public string doctor_name { get; set; } = string.Empty;
    public int appointment_id { get; set; }
    public string diagnosis { get; set; } = string.Empty;
    public string? notes { get; set; }
    public string? prescription { get; set; }
    public DateTime created_at { get; set; }
    public DateTime? updated_at { get; set; }
}
