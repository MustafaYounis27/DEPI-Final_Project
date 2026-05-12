using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.Invoice;
public class InvoiceResponse
{
    public int invoice_id { get; set; }
    public int patient_id { get; set; }
    public int? appointment_id { get; set; }
    public decimal total_amount { get; set; }
    public InvoiceStatus status { get; set; }
    public DateTime issued_at { get; set; }
    public List<InvoiceLineItemResponse> line_items { get; set; } = new();
}
