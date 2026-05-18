using System;

namespace HealthCore.Core.Entities
{
    public class Patient
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        public int? AssignedDoctorId { get; set; }
        public User? AssignedDoctor { get; set; }
        
        public DateTime? LastVisit { get; set; }
        public string? Allergies { get; set; }
        public string? ChronicDiseases { get; set; }
    }
}
