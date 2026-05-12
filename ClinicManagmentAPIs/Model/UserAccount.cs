using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Model;

[Table("UserAccount")]
public class UserAccount
{
    [Key]
    [Column("user_id")]
    public int user_id { get; set; }

    [Required, StringLength(50)]
    [Column("username")]
    public string username { get; set; } = string.Empty;

    [Required, StringLength(200)]
    [Column("password_hash")]
    public string password_hash { get; set; } = string.Empty;

    [Required]
    [Column("employee_type")]
    public EmployeeType employee_type { get; set; }

    [Column("doctor_id_FK")]
    public int? doctor_id_FK { get; set; }
    public Doctor? Doctor { get; set; }

    [StringLength(200)]
    [Column("email")]
    public string? email { get; set; }

    [Column("active_flag")]
    public bool active_flag { get; set; } = true;

    [Column("created_at")]
    public DateTime created_at { get; set; } = DateTime.UtcNow;
}
