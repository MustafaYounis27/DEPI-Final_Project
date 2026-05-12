using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.Payment;
public class PaymentResponse
{
    public int payment_id { get; set; }
    public int invoice_id { get; set; }
    public decimal amount { get; set; }
    public PaymentMethod method { get; set; }
    public DateTime paid_at { get; set; }
    public int received_by_user_id { get; set; }
}
