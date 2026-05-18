using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HealthCore.Core.Entities
{
    public class Prescription
    {
        public int Id { get; set; }
        public int RecordId { get; set; }
        
        [JsonIgnore]
        public MedicalRecord? Record { get; set; }
        
        public int PatientId { get; set; }
        
        [JsonIgnore]
        public Patient? Patient { get; set; }
        
        public int DoctorId { get; set; }
        
        [JsonIgnore]
        public User? Doctor { get; set; }
        
        public DateTime Date { get; set; }
        public string Status { get; set; } = string.Empty;
        
        public List<Medication> Medications { get; set; } = new();
    }
}
