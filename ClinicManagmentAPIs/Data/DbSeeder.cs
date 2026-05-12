using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Data;

public static class DbSeeder
{
    // BEFORE running `dotnet ef migrations add InitialCreate`, generate a BCrypt hash of "Admin@123"
    // on your Windows dev box (e.g. in a C# scratchpad:
    //     Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Admin@123"));
    // ) and paste the ~60-char hash here. DO NOT leave this placeholder in place — the migration
    // will compile but the seeded admin will be unable to log in.
    //
    // After updating the hash, run on Windows from the project directory:
    //     dotnet ef migrations add InitialCreate -o Data/Migrations
    //     dotnet ef database update
    private const string AdminPasswordHash = "$2a$11$REPLACE_ME_WITH_GENERATED_HASH";

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
