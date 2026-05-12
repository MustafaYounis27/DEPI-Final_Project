using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Data;

public static class DbSeeder
{
    // BCrypt hash of "Admin@123" (cost 11). Change this in any non-dev environment.
    // Format $2b$ is produced by most BCrypt libraries; BCrypt.Net-Next accepts both $2a$ and $2b$.
    private const string AdminPasswordHash = "$2b$11$e7bOtTSI63Pjs4N7B/0Xju./.J6SLOnZlFUjCtkxcLRrfjLoYGmYa";

    public static void Apply(ModelBuilder b)
    {
        b.Entity<Specialty>().HasData(
            new Specialty { specialty_id = 1, name = "Cardiology" },
            new Specialty { specialty_id = 2, name = "Dermatology" },
            new Specialty { specialty_id = 3, name = "Pediatrics" },
            new Specialty { specialty_id = 4, name = "Orthopedics" },
            new Specialty { specialty_id = 5, name = "Neurology" },
            new Specialty { specialty_id = 6, name = "General Practice" });

        b.Entity<UserAccount>().HasData(new UserAccount
        {
            user_id = 1,
            username = "admin",
            password_hash = AdminPasswordHash,
            employee_type = EmployeeType.Admin,
            email = "admin@clinic.local",
            active_flag = true,
            created_at = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
