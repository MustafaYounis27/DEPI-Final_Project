namespace ClinicManagmentAPIs.DTOs.Vitals;
public class VitalsResponse
{
    public int vitals_id { get; set; }
    public int appointment_id { get; set; }
    public int patient_id { get; set; }
    public int recorded_by_user_id { get; set; }
    public string? blood_pressure { get; set; }
    public int? heart_rate { get; set; }
    public decimal? temperature { get; set; }
    public decimal? weight_kg { get; set; }
    public decimal? height_cm { get; set; }
    public DateTime recorded_at { get; set; }
}
