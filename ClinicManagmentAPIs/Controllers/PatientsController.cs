using ClinicManagmentAPIs.DTOs.Patient;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[Route("api/patients")]
[ApiController]
[Authorize] // any authenticated user can read
public class PatientsController : ControllerBase
{
    private readonly IPatientService _svc;
    public PatientsController(IPatientService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) =>
        Ok(await _svc.ListAsync(search, page, pageSize));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var p = await _svc.GetAsync(id);
        return p is null ? NotFound(new { message = "Patient not found." }) : Ok(p);
    }

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request)
    {
        try
        {
            var created = await _svc.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = created.patient_id }, created);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientRequest request)
    {
        try
        {
            var updated = await _svc.UpdateAsync(id, request);
            return updated is null ? NotFound() : Ok(updated);
        }
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
