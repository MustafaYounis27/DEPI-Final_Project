using System;
using System.Collections.Generic;

namespace HealthCore.Core.Entities
{
    public class Billing
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        
        public List<BillingItem> Items { get; set; } = new();
    }
}
