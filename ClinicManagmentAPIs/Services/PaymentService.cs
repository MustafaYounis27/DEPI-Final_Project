using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Payment;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class PaymentService : IPaymentService
{
    private readonly DBContext _db;
    private readonly ICurrentUser _user;
    private readonly IAuditLogger _audit;
    private readonly IInvoiceService _invoices;
    public PaymentService(DBContext db, ICurrentUser user, IAuditLogger audit, IInvoiceService invoices)
    { _db = db; _user = user; _audit = audit; _invoices = invoices; }

    public async Task<IReadOnlyList<PaymentResponse>> ListForInvoiceAsync(int invoiceId) =>
        await _db.Payments.Where(p => p.invoice_id_FK == invoiceId)
            .OrderBy(p => p.paid_at)
            .Select(p => Map(p)).ToListAsync();

    public async Task<PaymentResponse> CreateAsync(int invoiceId, CreatePaymentRequest req)
    {
        var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.invoice_id == invoiceId)
            ?? throw new InvalidOperationException("Invoice not found.");
        if (inv.status == InvoiceStatus.Void)
            throw new InvalidOperationException("Cannot pay a void invoice.");

        var p = new Payment
        {
            invoice_id_FK = invoiceId,
            amount = req.amount,
            method = req.method,
            paid_at = req.paid_at,
            received_by_user_id_FK = _user.UserId
        };
        _db.Payments.Add(p);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Insert, "Payment", p.payment_id);

        await _invoices.MaybeAutoMarkPaidAsync(invoiceId);

        return Map(p);
    }

    private static PaymentResponse Map(Payment p) => new()
    {
        payment_id = p.payment_id,
        invoice_id = p.invoice_id_FK,
        amount = p.amount,
        method = p.method,
        paid_at = p.paid_at,
        received_by_user_id = p.received_by_user_id_FK
    };
}
