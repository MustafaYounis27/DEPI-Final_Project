using ClinicManagmentAPIs.DTOs.PatientHistory;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[ApiController]
[Authorize]
public class PatientHistoryController : ControllerBase
{
    private readonly IPatientHistoryService _svc;
    public PatientHistoryController(IPatientHistoryService svc) => _svc = svc;

    [HttpGet("api/patients/{patientId:int}/history")]
    public async Task<IActionResult> ListForPatient(int patientId) =>
        Ok(await _svc.ListForPatientAsync(patientId));

    [HttpGet("api/history/{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var h = await _svc.GetAsync(id);
        return h is null ? NotFound() : Ok(h);
    }

    [HttpPost("api/patients/{patientId:int}/history")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> Create(int patientId, [FromBody] CreatePatientHistoryRequest request)
    {
        try
        {
            var h = await _svc.CreateAsync(patientId, request);
            return CreatedAtAction(nameof(Get), new { id = h.history_id }, h);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("api/history/{id:int}")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientHistoryRequest request)
    {
        try
        {
            var h = await _svc.UpdateAsync(id, request);
            return h is null ? NotFound() : Ok(h);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpDelete("api/history/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _svc.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
