using ClinicManagmentAPIs.DTOs.Payment;
namespace ClinicManagmentAPIs.Services;
public interface IPaymentService
{
    Task<IReadOnlyList<PaymentResponse>> ListForInvoiceAsync(int invoiceId);
    Task<PaymentResponse> CreateAsync(int invoiceId, CreatePaymentRequest request);
}
