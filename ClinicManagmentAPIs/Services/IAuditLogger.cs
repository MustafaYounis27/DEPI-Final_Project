using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Services;

public interface IAuditLogger
{
    Task LogAsync(AuditAction action, string? entityName, int? entityId, string? details = null);
    Task LogLoginAsync(int? userId, string usernameAttempted, bool success);
}
