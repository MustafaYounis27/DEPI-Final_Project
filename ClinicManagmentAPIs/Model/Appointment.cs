using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Model;

[Table("Appointment")]
public class Appointment
{
    [Key]
    [Column("appointment_id")]
    public int appointment_id { get; set; }

    [Required]
    [Column("patient_id_FK")]
    public int patient_id_FK { get; set; }
    public Patient Patient { get; set; } = null!;

    [Required]
    [Column("doctor_id_FK")]
    public int doctor_id_FK { get; set; }
    public Doctor Doctor { get; set; } = null!;

    [Required]
    [Column("scheduled_at")]
    public DateTime scheduled_at { get; set; }

    [Required]
    [Column("appointment_type")]
    public AppointmentType appointment_type { get; set; }

    [Required]
    [Column("status")]
    public AppointmentStatus status { get; set; } = AppointmentStatus.Scheduled;

    [StringLength(500)]
    [Column("reason")]
    public string? reason { get; set; }

    [Required]
    [Column("created_by_user_id_FK")]
    public int created_by_user_id_FK { get; set; }
    public UserAccount CreatedBy { get; set; } = null!;

    [Column("created_at")]
    public DateTime created_at { get; set; } = DateTime.UtcNow;
}
