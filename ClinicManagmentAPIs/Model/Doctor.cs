using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManagmentAPIs.Model;

[Table("Doctor")]
public class Doctor
{
    [Key]
    [Column("doctor_id")]
    public int doctor_id { get; set; }

    [Required, StringLength(100)]
    [Column("first_name")]
    public string first_name { get; set; } = string.Empty;

    [Required, StringLength(100)]
    [Column("last_name")]
    public string last_name { get; set; } = string.Empty;

    [Required]
    [Column("specialty_id_FK")]
    public int specialty_id_FK { get; set; }
    public Specialty Specialty { get; set; } = null!;

    [StringLength(30)]
    [Column("phone")]
    public string? phone { get; set; }

    [StringLength(200)]
    [Column("email")]
    public string? email { get; set; }

    [Column("active_flag")]
    public bool active_flag { get; set; } = true;

    [Column("created_at")]
    public DateTime created_at { get; set; } = DateTime.UtcNow;
}
