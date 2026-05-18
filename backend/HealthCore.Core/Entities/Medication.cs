using System.Text.Json.Serialization;

namespace HealthCore.Core.Entities
{
    public class Medication
    {
        public int Id { get; set; }
        public int PrescriptionId { get; set; }
        
        [JsonIgnore]
        public Prescription? Prescription { get; set; }
        
        public string Name { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string? Instructions { get; set; }
    }
}
