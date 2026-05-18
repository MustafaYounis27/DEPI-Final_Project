using System.Collections.Generic;
using System.Threading.Tasks;
using HealthCore.Core.Entities;
using HealthCore.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HealthCore.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController : ControllerBase
    {
        private readonly IRepository<AuditLog> _auditLogRepo;

        public AuditLogsController(IRepository<AuditLog> auditLogRepo)
        {
            _auditLogRepo = auditLogRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AuditLog>>> GetAuditLogs()
        {
            var logs = await _auditLogRepo.ListAllAsync();
            return Ok(logs);
        }

        [HttpPost]
        public async Task<ActionResult<AuditLog>> CreateAuditLog(AuditLog log)
        {
            var createdLog = await _auditLogRepo.AddAsync(log);
            return CreatedAtAction(nameof(GetAuditLogs), null, createdLog);
        }
    }
}
