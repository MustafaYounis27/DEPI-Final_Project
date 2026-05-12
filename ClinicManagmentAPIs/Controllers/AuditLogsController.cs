using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.AuditLog;
using ClinicManagmentAPIs.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Controllers;

[Route("api/audit-logs")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly DBContext _db;
    public AuditLogsController(DBContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] int? userId,
        [FromQuery] AuditAction? action,
        [FromQuery] string? entityName,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var q = _db.AuditLogs.AsQueryable();
        if (userId is int u) q = q.Where(a => a.user_id_FK == u);
        if (action is AuditAction ac) q = q.Where(a => a.action == ac);
        if (!string.IsNullOrEmpty(entityName)) q = q.Where(a => a.entity_name == entityName);
        if (from is DateTime f) q = q.Where(a => a.created_at >= f);
        if (to is DateTime t) q = q.Where(a => a.created_at <= t);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.audit_id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(a => new AuditLogResponse
            {
                audit_id = a.audit_id,
                user_id = a.user_id_FK,
                action = a.action,
                entity_name = a.entity_name,
                entity_id = a.entity_id,
                details = a.details,
                created_at = a.created_at
            }).ToListAsync();

        return Ok(new PagedResponse<AuditLogResponse> { items = items, total = total, page = page, pageSize = pageSize });
    }
}
