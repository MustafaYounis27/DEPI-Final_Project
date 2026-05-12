using ClinicManagmentAPIs.Auth;
using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Data;
using ClinicManagmentAPIs.DTOs.Common;
using ClinicManagmentAPIs.DTOs.Invoice;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Services;

public class InvoiceService : IInvoiceService
{
    private readonly DBContext _db;
    private readonly ICurrentUser _user;
    private readonly IAuditLogger _audit;
    public InvoiceService(DBContext db, ICurrentUser user, IAuditLogger audit) { _db = db; _user = user; _audit = audit; }

    public async Task<PagedResponse<InvoiceResponse>> ListAsync(int? patientId, InvoiceStatus? status, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var q = _db.Invoices.Include(i => i.LineItems).AsQueryable();
        if (patientId is int p) q = q.Where(i => i.patient_id_FK == p);
        if (status is InvoiceStatus s) q = q.Where(i => i.status == s);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(i => i.issued_at)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => Map(i)).ToListAsync();
        return new PagedResponse<InvoiceResponse> { items = items, total = total, page = page, pageSize = pageSize };
    }

    public async Task<InvoiceResponse?> GetAsync(int id)
    {
        var i = await _db.Invoices.Include(x => x.LineItems).FirstOrDefaultAsync(x => x.invoice_id == id);
        return i is null ? null : Map(i);
    }

    public async Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest req)
    {
        if (!await _db.Patients.AnyAsync(p => p.patient_id == req.patient_id))
            throw new InvalidOperationException("Patient not found.");
        if (req.appointment_id is int ai && !await _db.Appointments.AnyAsync(a => a.appointment_id == ai))
            throw new InvalidOperationException("Appointment not found.");

        var invoice = new Invoice
        {
            patient_id_FK = req.patient_id,
            appointment_id_FK = req.appointment_id,
            status = InvoiceStatus.Draft,
            issued_at = DateTime.UtcNow,
            created_by_user_id_FK = _user.UserId,
            LineItems = req.line_items.Select(li => new InvoiceLineItem
            {
                description = li.description,
                quantity = li.quantity,
                unit_price = li.unit_price,
                line_total = li.unit_price * li.quantity
            }).ToList()
        };
        invoice.total_amount = invoice.LineItems.Sum(li => li.line_total);

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Insert, "Invoice", invoice.invoice_id);
        return Map(invoice);
    }

    public async Task<InvoiceResponse?> UpdateStatusAsync(int id, InvoiceStatus status)
    {
        var inv = await _db.Invoices.Include(i => i.LineItems).FirstOrDefaultAsync(i => i.invoice_id == id);
        if (inv is null) return null;
        if (!IsLegalTransition(inv.status, status))
            throw new InvalidOperationException($"Illegal status transition {inv.status} -> {status}.");
        inv.status = status;
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Update, "Invoice", inv.invoice_id, $"status={status}");
        return Map(inv);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.invoice_id == id);
        if (inv is null) return false;
        if (await _db.Payments.AnyAsync(p => p.invoice_id_FK == id))
            throw new InvalidOperationException("Invoice has payments; cannot delete.");
        _db.Invoices.Remove(inv);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(AuditAction.Delete, "Invoice", id);
        return true;
    }

    public async Task MaybeAutoMarkPaidAsync(int invoiceId)
    {
        var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.invoice_id == invoiceId);
        if (inv is null) return;
        var paid = await _db.Payments.Where(p => p.invoice_id_FK == invoiceId).SumAsync(p => p.amount);
        if (paid >= inv.total_amount && inv.status != InvoiceStatus.Paid)
        {
            inv.status = InvoiceStatus.Paid;
            await _db.SaveChangesAsync();
            await _audit.LogAsync(AuditAction.Update, "Invoice", inv.invoice_id, "auto_paid");
        }
    }

    private static bool IsLegalTransition(InvoiceStatus from, InvoiceStatus to) =>
        (from, to) switch
        {
            (InvoiceStatus.Draft, InvoiceStatus.Sent) => true,
            (InvoiceStatus.Sent, InvoiceStatus.Paid) => true,
            (InvoiceStatus.Sent, InvoiceStatus.Void) => true,
            (InvoiceStatus.Draft, InvoiceStatus.Void) => true,
            _ => false
        };

    private static InvoiceResponse Map(Invoice i) => new()
    {
        invoice_id = i.invoice_id,
        patient_id = i.patient_id_FK,
        appointment_id = i.appointment_id_FK,
        total_amount = i.total_amount,
        status = i.status,
        issued_at = i.issued_at,
        line_items = i.LineItems.Select(li => new InvoiceLineItemResponse
        {
            line_item_id = li.line_item_id,
            description = li.description,
            quantity = li.quantity,
            unit_price = li.unit_price,
            line_total = li.line_total
        }).ToList()
    };
}
