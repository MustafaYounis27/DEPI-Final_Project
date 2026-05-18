using System.Text.Json.Serialization;

namespace HealthCore.Core.Entities
{
    public class BillingItem
    {
        public int Id { get; set; }
        public int BillingId { get; set; }
        
        [JsonIgnore]
        public Billing? Billing { get; set; }
        
        public string Description { get; set; } = string.Empty;
        public decimal Cost { get; set; }
    }
}
