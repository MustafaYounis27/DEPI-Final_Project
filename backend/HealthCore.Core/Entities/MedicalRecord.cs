using System;

namespace HealthCore.Core.Entities
{
    public class MedicalRecord
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        
        public int DoctorId { get; set; }
        public User? Doctor { get; set; }
        
        public DateTime Date { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        
        public int? VitalsId { get; set; }
        public Vitals? Vitals { get; set; }
    }
}
