using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.DTOs.Appointment;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[Route("api/appointments")]
[ApiController]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _svc;
    public AppointmentsController(IAppointmentService svc) => _svc = svc;

    // Staff + Admin: all appointments (filterable)
    [HttpGet]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> List(
        [FromQuery] int? doctorId,
        [FromQuery] int? patientId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] AppointmentStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20) =>
        Ok(await _svc.ListAsync(doctorId, patientId, from, to, status, page, pageSize));

    // Doctor: appointments where doctor_id == claim
    [HttpGet("mine")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> ListMine(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] AppointmentStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try { return Ok(await _svc.ListMineAsync(from, to, status, page, pageSize)); }
        catch (InvalidOperationException) { return Forbid(); }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var a = await _svc.GetAsync(id);
        return a is null ? NotFound() : Ok(a);
    }

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request)
    {
        try
        {
            var created = await _svc.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = created.appointment_id }, created);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentRequest request)
    {
        try
        {
            var a = await _svc.UpdateAsync(id, request);
            return a is null ? NotFound() : Ok(a);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var ok = await _svc.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}
