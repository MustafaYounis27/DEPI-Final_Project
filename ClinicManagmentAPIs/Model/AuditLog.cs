using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Model;

[Table("AuditLog")]
public class AuditLog
{
    [Key]
    [Column("audit_id")]
    public int audit_id { get; set; }

    [Column("user_id_FK")]
    public int? user_id_FK { get; set; }
    public UserAccount? User { get; set; }

    [Required]
    [Column("action")]
    public AuditAction action { get; set; }

    [StringLength(100)]
    [Column("entity_name")]
    public string? entity_name { get; set; }

    [Column("entity_id")]
    public int? entity_id { get; set; }

    [StringLength(2000)]
    [Column("details")]
    public string? details { get; set; }

    [Column("created_at")]
    public DateTime created_at { get; set; } = DateTime.UtcNow;
}
