using System;
using System.Threading.Tasks;
using HealthCore.Core.Entities;
using HealthCore.Core.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HealthCore.Api.Filters
{
    public class AuditLogFilter : IAsyncActionFilter
    {
        private readonly IRepository<AuditLog> _auditRepo;

        public AuditLogFilter(IRepository<AuditLog> auditRepo)
        {
            _auditRepo = auditRepo;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next();

            var method = context.HttpContext.Request.Method;
            
            // Only log mutating actions
            if (method == "POST" || method == "PUT" || method == "DELETE")
            {
                // Ensure the request was successful
                if (resultContext.Exception == null && 
                    resultContext.HttpContext.Response.StatusCode >= 200 && 
                    resultContext.HttpContext.Response.StatusCode < 300)
                {
                    var controllerName = context.RouteData.Values["controller"]?.ToString() ?? "System";
                    
                    var actionName = method switch {
                        "POST" => "Created",
                        "PUT" => "Updated",
                        "DELETE" => "Deleted",
                        _ => "Modified"
                    };

                    var entityName = controllerName;
                    if (entityName.EndsWith("s", StringComparison.OrdinalIgnoreCase)) 
                    {
                        entityName = entityName.Substring(0, entityName.Length - 1);
                    }

                    var log = new AuditLog 
                    {
                        Action = $"{actionName} {entityName}",
                        Details = $"A {entityName.ToLower()} was successfully {actionName.ToLower()}.",
                        Timestamp = DateTime.UtcNow
                    };

                    await _auditRepo.AddAsync(log);
                }
            }
        }
    }
}
