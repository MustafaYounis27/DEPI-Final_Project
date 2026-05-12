using ClinicManagmentAPIs.Model;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagmentAPIs.Data
{
            public class DBContext : DbContext
        {
            public DBContext(DbContextOptions<DBContext> options)
                : base(options)
            {
            }
        public DbSet<UserAccount> User { get; set; }
        public DbSet<Patient> Patients { get; set; }
      /*  public object User { get; internal set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table mapping
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("UserAccount");

                // Index for faster lookups
                entity.HasIndex(e => e.username).IsUnique();
                entity.HasIndex(e => e.email).IsUnique();
            });
        }*/
    }
}

