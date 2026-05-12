using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Model;

[Table("Invoice")]
public class Invoice
{
    [Key]
    [Column("invoice_id")]
    public int invoice_id { get; set; }

    [Required]
    [Column("patient_id_FK")]
    public int patient_id_FK { get; set; }
    public Patient Patient { get; set; } = null!;

    [Column("appointment_id_FK")]
    public int? appointment_id_FK { get; set; }
    public Appointment? Appointment { get; set; }

    [Required]
    [Column("total_amount", TypeName = "decimal(12,2)")]
    public decimal total_amount { get; set; }

    [Required]
    [Column("status")]
    public InvoiceStatus status { get; set; } = InvoiceStatus.Draft;

    [Column("issued_at")]
    public DateTime issued_at { get; set; } = DateTime.UtcNow;

    [Required]
    [Column("created_by_user_id_FK")]
    public int created_by_user_id_FK { get; set; }
    public UserAccount CreatedBy { get; set; } = null!;

    public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
