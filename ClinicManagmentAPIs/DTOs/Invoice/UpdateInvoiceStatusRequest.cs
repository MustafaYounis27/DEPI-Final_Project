using System.ComponentModel.DataAnnotations;
using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.Invoice;
public class UpdateInvoiceStatusRequest
{
    [Required] public InvoiceStatus status { get; set; }
}
