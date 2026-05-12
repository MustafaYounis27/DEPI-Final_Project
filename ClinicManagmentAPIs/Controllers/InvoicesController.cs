using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.DTOs.Invoice;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[Route("api/invoices")]
[ApiController]
[Authorize(Roles = "Staff,Admin")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _svc;
    public InvoicesController(IInvoiceService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? patientId, [FromQuery] InvoiceStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) =>
        Ok(await _svc.ListAsync(patientId, status, page, pageSize));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var i = await _svc.GetAsync(id);
        return i is null ? NotFound() : Ok(i);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
    {
        try
        {
            var inv = await _svc.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = inv.invoice_id }, inv);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInvoiceStatusRequest request)
    {
        try
        {
            var inv = await _svc.UpdateStatusAsync(id, request.status);
            return inv is null ? NotFound() : Ok(inv);
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
