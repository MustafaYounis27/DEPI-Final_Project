using ClinicManagmentAPIs.Common;
using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Data;

public class DBContext : DbContext
{
    public DBContext(DbContextOptions<DBContext> options) : base(options) { }

    public DbSet<UserAccount> Users => Set<UserAccount>();
    public DbSet<Specialty> Specialties => Set<Specialty>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<PatientHistory> PatientHistories => Set<PatientHistory>();
    public DbSet<Vitals> Vitals => Set<Vitals>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // ---------- UserAccount ----------
        b.Entity<UserAccount>(e =>
        {
            e.HasIndex(u => u.username).IsUnique();
            e.Property(u => u.employee_type).HasConversion<string>().HasMaxLength(20);
            e.HasOne(u => u.Doctor)
                .WithMany()
                .HasForeignKey(u => u.doctor_id_FK)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Specialty ----------
        b.Entity<Specialty>(e =>
        {
            e.HasIndex(s => s.name).IsUnique();
        });

        // ---------- Doctor ----------
        b.Entity<Doctor>(e =>
        {
            e.HasOne(d => d.Specialty)
                .WithMany(s => s.Doctors)
                .HasForeignKey(d => d.specialty_id_FK)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Patient ----------
        b.Entity<Patient>(e =>
        {
            e.HasIndex(p => p.mrn).IsUnique();
        });

        // ---------- Appointment ----------
        b.Entity<Appointment>(e =>
        {
            e.Property(a => a.appointment_type).HasConversion<string>().HasMaxLength(20);
            e.Property(a => a.status).HasConversion<string>().HasMaxLength(20);

            e.HasIndex(a => a.doctor_id_FK);
            e.HasIndex(a => a.scheduled_at);

            e.HasOne(a => a.Patient).WithMany().HasForeignKey(a => a.patient_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Doctor).WithMany().HasForeignKey(a => a.doctor_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.CreatedBy).WithMany().HasForeignKey(a => a.created_by_user_id_FK).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- PatientHistory ----------
        b.Entity<PatientHistory>(e =>
        {
            e.HasOne(h => h.Patient).WithMany().HasForeignKey(h => h.patient_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(h => h.Doctor).WithMany().HasForeignKey(h => h.doctor_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(h => h.Appointment).WithMany().HasForeignKey(h => h.appointment_id_FK).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Vitals ----------
        b.Entity<Vitals>(e =>
        {
            e.HasOne(v => v.Appointment).WithMany().HasForeignKey(v => v.appointment_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.Patient).WithMany().HasForeignKey(v => v.patient_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.RecordedBy).WithMany().HasForeignKey(v => v.recorded_by_user_id_FK).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Invoice / LineItem / Payment ----------
        b.Entity<Invoice>(e =>
        {
            e.Property(i => i.status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(i => i.Patient).WithMany().HasForeignKey(i => i.patient_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Appointment).WithMany().HasForeignKey(i => i.appointment_id_FK).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.CreatedBy).WithMany().HasForeignKey(i => i.created_by_user_id_FK).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<InvoiceLineItem>(e =>
        {
            e.HasOne(li => li.Invoice)
                .WithMany(i => i.LineItems)
                .HasForeignKey(li => li.invoice_id_FK)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Payment>(e =>
        {
            e.Property(p => p.method).HasConversion<string>().HasMaxLength(20);
            e.HasOne(p => p.Invoice)
                .WithMany(i => i.Payments)
                .HasForeignKey(p => p.invoice_id_FK)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(p => p.ReceivedBy).WithMany().HasForeignKey(p => p.received_by_user_id_FK).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- AuditLog ----------
        b.Entity<AuditLog>(e =>
        {
            e.Property(a => a.action).HasConversion<string>().HasMaxLength(20);
            e.HasOne(a => a.User).WithMany().HasForeignKey(a => a.user_id_FK).OnDelete(DeleteBehavior.Restrict);
        });

        // Seed data
        DbSeeder.Apply(b);
    }
}
