using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.DTOs.Specialty;
public class CreateSpecialtyRequest
{
    [Required, StringLength(100)]
    public string name { get; set; } = string.Empty;
    [StringLength(500)]
    public string? description { get; set; }
}
