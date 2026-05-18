using System;

namespace HealthCore.Core.Entities
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        
        public int DoctorId { get; set; }
        public User? Doctor { get; set; }
        
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        
        public string Status { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}
