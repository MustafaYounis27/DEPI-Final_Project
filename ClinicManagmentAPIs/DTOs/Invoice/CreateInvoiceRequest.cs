using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.DTOs.Invoice;
public class CreateInvoiceRequest
{
    [Required] public int patient_id { get; set; }
    public int? appointment_id { get; set; }
    [Required, MinLength(1)]
    public List<CreateInvoiceLineItemDto> line_items { get; set; } = new();
}
