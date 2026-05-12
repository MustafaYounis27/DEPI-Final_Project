using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManagmentAPIs.Model;

[Table("PatientHistory")]
public class PatientHistory
{
    [Key]
    [Column("history_id")]
    public int history_id { get; set; }

    [Required]
    [Column("patient_id_FK")]
    public int patient_id_FK { get; set; }
    public Patient Patient { get; set; } = null!;

    [Required]
    [Column("doctor_id_FK")]
    public int doctor_id_FK { get; set; }
    public Doctor Doctor { get; set; } = null!;

    [Required]
    [Column("appointment_id_FK")]
    public int appointment_id_FK { get; set; }
    public Appointment Appointment { get; set; } = null!;

    [Required, StringLength(1000)]
    [Column("diagnosis")]
    public string diagnosis { get; set; } = string.Empty;

    [StringLength(4000)]
    [Column("notes")]
    public string? notes { get; set; }

    [StringLength(2000)]
    [Column("prescription")]
    public string? prescription { get; set; }

    [Column("created_at")]
    public DateTime created_at { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? updated_at { get; set; }
}
