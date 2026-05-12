using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManagmentAPIs.Model;

[Table("Specialty")]
public class Specialty
{
    [Key]
    [Column("specialty_id")]
    public int specialty_id { get; set; }

    [Required, StringLength(100)]
    [Column("name")]
    public string name { get; set; } = string.Empty;

    [StringLength(500)]
    [Column("description")]
    public string? description { get; set; }

    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
