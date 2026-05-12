using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.DTOs.Invoice;
public class CreateInvoiceLineItemDto
{
    [Required, StringLength(500)] public string description { get; set; } = string.Empty;
    [Required, Range(1, int.MaxValue)] public int quantity { get; set; }
    [Required, Range(0.01, 999999999.99)] public decimal unit_price { get; set; }
}
