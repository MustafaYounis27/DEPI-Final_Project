namespace ClinicManagmentAPIs.DTOs.Invoice;
public class InvoiceLineItemResponse
{
    public int line_item_id { get; set; }
    public string description { get; set; } = string.Empty;
    public int quantity { get; set; }
    public decimal unit_price { get; set; }
    public decimal line_total { get; set; }
}
