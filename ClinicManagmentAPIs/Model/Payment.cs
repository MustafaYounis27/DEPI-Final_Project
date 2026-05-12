using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicManagmentAPIs.Common;

namespace ClinicManagmentAPIs.Model;

[Table("Payment")]
public class Payment
{
    [Key]
    [Column("payment_id")]
    public int payment_id { get; set; }

    [Required]
    [Column("invoice_id_FK")]
    public int invoice_id_FK { get; set; }
    public Invoice Invoice { get; set; } = null!;

    [Required]
    [Column("amount", TypeName = "decimal(12,2)")]
    public decimal amount { get; set; }

    [Required]
    [Column("method")]
    public PaymentMethod method { get; set; }

    [Required]
    [Column("paid_at")]
    public DateTime paid_at { get; set; }

    [Required]
    [Column("received_by_user_id_FK")]
    public int received_by_user_id_FK { get; set; }
    public UserAccount ReceivedBy { get; set; } = null!;
}
