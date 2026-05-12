using ClinicManagmentAPIs.DTOs.Payment;
using ClinicManagmentAPIs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagmentAPIs.Controllers;

[ApiController]
[Authorize(Roles = "Staff,Admin")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _svc;
    public PaymentsController(IPaymentService svc) => _svc = svc;

    [HttpGet("api/invoices/{invoiceId:int}/payments")]
    public async Task<IActionResult> List(int invoiceId) => Ok(await _svc.ListForInvoiceAsync(invoiceId));

    [HttpPost("api/invoices/{invoiceId:int}/payments")]
    public async Task<IActionResult> Create(int invoiceId, [FromBody] CreatePaymentRequest request)
    {
        try
        {
            var p = await _svc.CreateAsync(invoiceId, request);
            return Created($"/api/payments/{p.payment_id}", p);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}
