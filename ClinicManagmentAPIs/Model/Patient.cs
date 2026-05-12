using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManagmentAPIs.Model
{
    [Table("Patient")]
    public class Patient
    {
        [Key]
        [Column("patient_id")]
        public int patient_id { get; set; }

        [Required]
        [Column("mrn")]
        public string mrn { get; set; } = string.Empty;

        [Required]
        [Column("first_name")]
        public string first_name { get; set; } = string.Empty;

        [Required]
        [Column("last_name")]
        public string last_name { get; set; } = string.Empty;

        [Required]
        [Column("date_of_birth")]
        public DateOnly date_of_birth { get; set; }

        [Required]
        [Column("sex")]
        public string sex { get; set; } = string.Empty;

        [Column("phone")]
        public string? phone { get; set; }

        [Column("email")]
        public string? email { get; set; }

        [Column("address")]
        public string? address { get; set; }

        [Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
