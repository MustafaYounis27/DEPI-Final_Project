using System;
using System.Collections.Generic;
using System.Linq;
using HealthCore.Core.Entities;
using HealthCore.Core.Enums;
using BCrypt.Net;

namespace HealthCore.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(HealthCoreDbContext context)
        {
            context.Database.EnsureCreated();

            // Look for any users.
            if (context.Users.Any())
            {
                return;   // DB has been seeded
            }

            var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            var users = new User[]
            {
                new User { Name = "Dr. Sarah Wilson", Email = "doctor@hospital.com", Role = Role.Doctor, Specialty = "Cardiology", Avatar = "https://ui-avatars.com/api/?name=Sarah+Wilson&background=0D8ABC&color=fff", PasswordHash = defaultPasswordHash, MustChangePassword = false },
                new User { Name = "John Staff", Email = "staff@hospital.com", Role = Role.Staff, Department = "Administration", Avatar = "https://ui-avatars.com/api/?name=John+Staff&background=random", PasswordHash = defaultPasswordHash, MustChangePassword = false },
                new User { Name = "Admin User", Email = "admin@hospital.com", Role = Role.Admin, Avatar = "https://ui-avatars.com/api/?name=Admin+User&background=333&color=fff", PasswordHash = defaultPasswordHash, MustChangePassword = false }
            };
            foreach (User u in users)
            {
                context.Users.Add(u);
            }
            context.SaveChanges();

            // Refetch to get IDs
            var doctor = context.Users.First(u => u.Email == "doctor@hospital.com");

            var patients = new Patient[]
            {
                new Patient { Name = "Alice Johnson", Email = "alice@example.com", Phone = "555-0101", DateOfBirth = new DateTime(1985, 5, 12), Gender = "Female", Address = "123 Maple St", BloodGroup = "A+", Status = "Inpatient", AssignedDoctorId = doctor.Id, LastVisit = new DateTime(2024, 3, 10), Allergies = "Penicillin", ChronicDiseases = "Hypertension" },
                new Patient { Name = "Bob Smith", Email = "bob@example.com", Phone = "555-0102", DateOfBirth = new DateTime(1990, 11, 23), Gender = "Male", Address = "456 Oak Ave", BloodGroup = "O-", Status = "Outpatient", AssignedDoctorId = doctor.Id, LastVisit = new DateTime(2024, 3, 12), ChronicDiseases = "Diabetes Type 2" },
                new Patient { Name = "Charlie Brown", Email = "charlie@example.com", Phone = "555-0103", DateOfBirth = new DateTime(1978, 8, 5), Gender = "Male", Address = "789 Pine Rd", BloodGroup = "B+", Status = "Inpatient", AssignedDoctorId = doctor.Id, LastVisit = new DateTime(2024, 3, 8), Allergies = "Peanuts, Latex" }
            };
            foreach (Patient p in patients)
            {
                context.Patients.Add(p);
            }
            context.SaveChanges();

            var alice = context.Patients.First(p => p.Name == "Alice Johnson");
            var bob = context.Patients.First(p => p.Name == "Bob Smith");
            var charlie = context.Patients.First(p => p.Name == "Charlie Brown");

            var appointments = new Appointment[]
            {
                new Appointment { PatientId = alice.Id, DoctorId = doctor.Id, Date = DateTime.Now.AddDays(-2), Time = new TimeSpan(9, 0, 0), Status = "Completed", Reason = "Routine Checkup" },
                new Appointment { PatientId = bob.Id, DoctorId = doctor.Id, Date = DateTime.Now.AddDays(-1), Time = new TimeSpan(10, 30, 0), Status = "Completed", Reason = "Follow-up" },
                new Appointment { PatientId = charlie.Id, DoctorId = doctor.Id, Date = DateTime.Now, Time = new TimeSpan(14, 0, 0), Status = "Scheduled", Reason = "Consultation" },
                new Appointment { PatientId = bob.Id, DoctorId = doctor.Id, Date = DateTime.Now.AddDays(1), Time = new TimeSpan(11, 0, 0), Status = "Scheduled", Reason = "Annual Physical" }
            };
            foreach (Appointment a in appointments)
            {
                context.Appointments.Add(a);
            }
            context.SaveChanges();

            var vitals = new Vitals
            {
                PatientId = alice.Id, RecordedById = doctor.Id, Date = new DateTime(2024, 3, 10), Time = new TimeSpan(9, 15, 0), Temperature = "37.2", BloodPressure = "120/82", HeartRate = "75", RespiratoryRate = "16", OxygenSaturation = "98", Weight = "68", Height = "165"
            };
            context.Vitals.Add(vitals);
            context.SaveChanges();

            var mr = new MedicalRecord
            {
                PatientId = alice.Id, DoctorId = doctor.Id, Date = new DateTime(2024, 3, 10), Diagnosis = "Hypertension", Treatment = "Lifestyle changes and medication", Notes = "Patient showing improvement.", VitalsId = vitals.Id
            };
            context.MedicalRecords.Add(mr);
            context.SaveChanges();

            var prescription = new Prescription
            {
                RecordId = mr.Id, PatientId = alice.Id, DoctorId = doctor.Id, Date = new DateTime(2024, 3, 10), Status = "Active",
                Medications = new List<Medication> { new Medication { Name = "Lisinopril", Dosage = "10mg", Frequency = "Once daily", Duration = "30 days" } }
            };
            context.Prescriptions.Add(prescription);
            context.SaveChanges();

            var billings = new Billing[]
            {
                new Billing { PatientId = alice.Id, Date = DateTime.Now.AddDays(-6), Amount = 50.00m, Status = "Paid", Items = new List<BillingItem> { new BillingItem { Description = "Consultation Fee", Cost = 50.00m } } },
                new Billing { PatientId = bob.Id, Date = DateTime.Now.AddDays(-5), Amount = 75.00m, Status = "Paid", Items = new List<BillingItem> { new BillingItem { Description = "Consultation Fee", Cost = 75.00m } } },
                new Billing { PatientId = charlie.Id, Date = DateTime.Now.AddDays(-4), Amount = 300.00m, Status = "Paid", Items = new List<BillingItem> { new BillingItem { Description = "Emergency Visit", Cost = 300.00m } } },
                new Billing { PatientId = alice.Id, Date = DateTime.Now.AddDays(-3), Amount = 200.00m, Status = "Paid", Items = new List<BillingItem> { new BillingItem { Description = "Specialist Consultation", Cost = 200.00m } } },
                new Billing { PatientId = bob.Id, Date = DateTime.Now.AddDays(-2), Amount = 450.00m, Status = "Paid", Items = new List<BillingItem> { new BillingItem { Description = "X-Ray", Cost = 250.00m }, new BillingItem { Description = "Consultation", Cost = 200.00m } } },
                new Billing { PatientId = charlie.Id, Date = DateTime.Now.AddDays(-1), Amount = 120.00m, Status = "Unpaid", Items = new List<BillingItem> { new BillingItem { Description = "Routine Checkup", Cost = 120.00m } } },
                new Billing { PatientId = alice.Id, Date = DateTime.Now, Amount = 500.00m, Status = "Unpaid", Items = new List<BillingItem> { new BillingItem { Description = "Surgery Consult", Cost = 500.00m } } }
            };
            foreach (Billing b in billings)
            {
                context.Billings.Add(b);
            }
            context.SaveChanges();
            
            var admin = context.Users.First(u => u.Email == "admin@hospital.com");
            var staff = context.Users.First(u => u.Email == "staff@hospital.com");

            var logs = new AuditLog[]
            {
                new AuditLog { UserId = admin.Id, Action = "User Created", Timestamp = DateTime.Now.AddDays(-2), Details = "Added new doctor Dr. Sarah Wilson" },
                new AuditLog { UserId = staff.Id, Action = "Patient Registered", Timestamp = DateTime.Now.AddDays(-1), Details = "Registered patient Alice Johnson" },
                new AuditLog { UserId = doctor.Id, Action = "Prescription Added", Timestamp = DateTime.Now.AddHours(-5), Details = "Prescribed Lisinopril to Alice Johnson" },
                new AuditLog { UserId = staff.Id, Action = "Appointment Scheduled", Timestamp = DateTime.Now.AddHours(-2), Details = "Scheduled appointment for Bob Smith" },
                new AuditLog { UserId = admin.Id, Action = "System Update", Timestamp = DateTime.Now.AddHours(-1), Details = "System security patches applied successfully" }
            };
            foreach (AuditLog l in logs)
            {
                context.AuditLogs.Add(l);
            }
            context.SaveChanges();
        }
    }
}
