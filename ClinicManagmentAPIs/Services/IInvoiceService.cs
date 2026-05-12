using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.DTOs.Common;
using ClinicManagmentAPIs.DTOs.Invoice;
namespace ClinicManagmentAPIs.Services;
public interface IInvoiceService
{
    Task<PagedResponse<InvoiceResponse>> ListAsync(int? patientId, InvoiceStatus? status, int page, int pageSize);
    Task<InvoiceResponse?> GetAsync(int id);
    Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request);
    Task<InvoiceResponse?> UpdateStatusAsync(int id, InvoiceStatus status);
    Task<bool> DeleteAsync(int id);
    Task MaybeAutoMarkPaidAsync(int invoiceId);
}
