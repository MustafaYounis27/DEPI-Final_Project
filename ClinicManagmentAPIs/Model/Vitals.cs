using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManagmentAPIs.Model;

[Table("Vitals")]
public class Vitals
{
    [Key]
    [Column("vitals_id")]
    public int vitals_id { get; set; }

    [Required]
    [Column("appointment_id_FK")]
    public int appointment_id_FK { get; set; }
    public Appointment Appointment { get; set; } = null!;

    [Required]
    [Column("patient_id_FK")]
    public int patient_id_FK { get; set; }
    public Patient Patient { get; set; } = null!;

    [Required]
    [Column("recorded_by_user_id_FK")]
    public int recorded_by_user_id_FK { get; set; }
    public UserAccount RecordedBy { get; set; } = null!;

    [StringLength(20)]
    [Column("blood_pressure")]
    public string? blood_pressure { get; set; }

    [Column("heart_rate")]
    public int? heart_rate { get; set; }

    [Column("temperature", TypeName = "decimal(4,1)")]
    public decimal? temperature { get; set; }

    [Column("weight_kg", TypeName = "decimal(5,2)")]
    public decimal? weight_kg { get; set; }

    [Column("height_cm", TypeName = "decimal(5,2)")]
    public decimal? height_cm { get; set; }

    [Column("recorded_at")]
    public DateTime recorded_at { get; set; } = DateTime.UtcNow;
}
