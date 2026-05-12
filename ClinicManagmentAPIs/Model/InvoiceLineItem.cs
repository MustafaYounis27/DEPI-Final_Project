using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManagmentAPIs.Model;

[Table("InvoiceLineItem")]
public class InvoiceLineItem
{
    [Key]
    [Column("line_item_id")]
    public int line_item_id { get; set; }

    [Required]
    [Column("invoice_id_FK")]
    public int invoice_id_FK { get; set; }
    public Invoice Invoice { get; set; } = null!;

    [Required, StringLength(500)]
    [Column("description")]
    public string description { get; set; } = string.Empty;

    [Required, Range(1, int.MaxValue)]
    [Column("quantity")]
    public int quantity { get; set; }

    [Required]
    [Column("unit_price", TypeName = "decimal(12,2)")]
    public decimal unit_price { get; set; }

    [Required]
    [Column("line_total", TypeName = "decimal(12,2)")]
    public decimal line_total { get; set; }
}
