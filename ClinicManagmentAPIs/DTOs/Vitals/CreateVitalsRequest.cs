using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.DTOs.Vitals;
public class CreateVitalsRequest
{
    [StringLength(20)] public string? blood_pressure { get; set; }
    [Range(0, 400)] public int? heart_rate { get; set; }
    [Range(0, 50)] public decimal? temperature { get; set; }
    [Range(0, 500)] public decimal? weight_kg { get; set; }
    [Range(0, 300)] public decimal? height_cm { get; set; }
    [Required] public DateTime recorded_at { get; set; }
}
