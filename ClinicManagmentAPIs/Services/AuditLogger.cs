using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.Model;

namespace ClinicManagmentAPIs.Services;

public class AuditLogger : IAuditLogger
{
    private readonly DBContext _db;
    private readonly ICurrentUser _currentUser;

    public AuditLogger(DBContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task LogAsync(AuditAction action, string? entityName, int? entityId, string? details = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            user_id_FK = _currentUser.IsAuthenticated ? _currentUser.UserId : null,
            action = action,
            entity_name = entityName,
            entity_id = entityId,
            details = details,
            created_at = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    public async Task LogLoginAsync(int? userId, string usernameAttempted, bool success)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            user_id_FK = userId,
            action = AuditAction.Login,
            entity_name = null,
            entity_id = null,
            details = success ? null : usernameAttempted,
            created_at = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}
