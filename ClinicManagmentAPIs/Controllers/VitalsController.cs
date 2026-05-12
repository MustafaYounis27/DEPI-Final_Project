using ClinicManagmentAPIs.DTOs.Vitals;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[ApiController]
[Authorize]
public class VitalsController : ControllerBase
{
    private readonly IVitalsService _svc;
    public VitalsController(IVitalsService svc) => _svc = svc;

    [HttpGet("api/appointments/{appointmentId:int}/vitals")]
    public async Task<IActionResult> List(int appointmentId) =>
        Ok(await _svc.ListForAppointmentAsync(appointmentId));

    [HttpPost("api/appointments/{appointmentId:int}/vitals")]
    [Authorize(Roles = "Doctor,Staff,Admin")]
    public async Task<IActionResult> Create(int appointmentId, [FromBody] CreateVitalsRequest request)
    {
        try
        {
            var v = await _svc.CreateAsync(appointmentId, request);
            return Created($"/api/vitals/{v.vitals_id}", v);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("api/vitals/{id:int}")]
    [Authorize(Roles = "Doctor,Staff,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVitalsRequest request)
    {
        try
        {
            var v = await _svc.UpdateAsync(id, request);
            return v is null ? NotFound() : Ok(v);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }
}
