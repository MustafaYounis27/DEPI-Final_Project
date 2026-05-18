using System;
using HealthCore.Core.Enums;

namespace HealthCore.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Role Role { get; set; }
        public string? Avatar { get; set; }
        public string? Specialty { get; set; }
        public string? Department { get; set; }
        public bool MustChangePassword { get; set; } = false;
        
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string? Password { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
