using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.AuditLog;
public class AuditLogResponse
{
    public int audit_id { get; set; }
    public int? user_id { get; set; }
    public AuditAction action { get; set; }
    public string? entity_name { get; set; }
    public int? entity_id { get; set; }
    public string? details { get; set; }
    public DateTime created_at { get; set; }
}
