using System.ComponentModel.DataAnnotations;
using ClinicManagmentAPIs.Common;
namespace ClinicManagmentAPIs.DTOs.Payment;
public class CreatePaymentRequest
{
    [Required, Range(0.01, 999999999.99)] public decimal amount { get; set; }
    [Required] public PaymentMethod method { get; set; }
    [Required] public DateTime paid_at { get; set; }
}
