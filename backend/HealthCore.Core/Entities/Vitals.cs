using System;
using System.Text.Json.Serialization;

namespace HealthCore.Core.Entities
{
    public class Vitals
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        
        [JsonIgnore]
        public Patient? Patient { get; set; }
        
        public int RecordedById { get; set; }
        
        [JsonIgnore]
        public User? RecordedBy { get; set; }
        
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        
        public string Temperature { get; set; } = string.Empty;
        public string BloodPressure { get; set; } = string.Empty;
        public string HeartRate { get; set; } = string.Empty;
        public string RespiratoryRate { get; set; } = string.Empty;
        public string OxygenSaturation { get; set; } = string.Empty;
        
        public string? Weight { get; set; }
        public string? Height { get; set; }
    }
}
