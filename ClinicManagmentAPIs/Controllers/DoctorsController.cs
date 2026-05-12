using ClinicManagmentAPIs.DTOs.Doctor;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[Route("api/doctors")]
[ApiController]
[Authorize]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _svc;
    public DoctorsController(IDoctorService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? specialty_id, [FromQuery] bool? active) =>
        Ok(await _svc.ListAsync(specialty_id, active));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var d = await _svc.GetAsync(id);
        return d is null ? NotFound() : Ok(d);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorRequest request)
    {
        try
        {
            var d = await _svc.UpdateAsync(id, request);
            return d is null ? NotFound() : Ok(d);
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
