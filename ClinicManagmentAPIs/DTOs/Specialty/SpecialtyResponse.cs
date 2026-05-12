namespace ClinicManagmentAPIs.DTOs.Specialty;
public class SpecialtyResponse
{
    public int specialty_id { get; set; }
    public string name { get; set; } = string.Empty;
    public string? description { get; set; }
}
