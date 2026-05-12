# Clinic Management Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [docs/superpowers/specs/2026-05-12-clinic-backend-design.md](../specs/2026-05-12-clinic-backend-design.md)

**Goal:** Turn the skeletal `ClinicManagmentAPIs` project into a working clinic backend that satisfies the five user requirements (login per role, staff patient CRUD without delete, admin creates accounts, doctor sees own appointments, doctor/admin manage history) plus the agreed extensions (Specialty, Vitals, Billing, AuditLog, EmployeeType enum).

**Architecture:** Single ASP.NET Core .NET 10 Web API project, layered as Controllers → Services → DBContext. EF Core code-first with SQL Server. JWT bearer auth (BCrypt hashing). Strongly-typed enums stored as strings to match the documented CHECK constraints.

**Tech Stack:** ASP.NET Core 10, EF Core 10 (SQL Server), `BCrypt.Net-Next`, `Microsoft.AspNetCore.Authentication.JwtBearer`, Swashbuckle (Swagger).

**Verification approach:** The spec lists "unit + integration tests" as a non-goal. Each phase has a **manual verification step** using Swagger UI or `curl`, mapped to the spec's §9 acceptance criteria. The plan never says "add tests for the above" without showing the actual check.

**Working directory for all commands:** `/Users/mustafayounis/Desktop/DEPI-Final_Project/ClinicManagmentAPIs/` unless stated otherwise.

---

## Phase 0 — Pre-flight

### Task 0: Verify toolchain and DB connectivity

**Files:** none.

- [ ] **Step 1: Confirm .NET 10 SDK is installed**

  Run: `dotnet --list-sdks`
  Expected: at least one `10.0.*` line.

- [ ] **Step 2: Confirm `dotnet ef` tool is installed**

  Run: `dotnet ef --version`
  Expected: prints a version. If "command not found", run: `dotnet tool install --global dotnet-ef`

- [ ] **Step 3: Build the project as-is**

  Run: `cd /Users/mustafayounis/Desktop/DEPI-Final_Project/ClinicManagmentAPIs && dotnet build`
  Expected: Build succeeded, 0 errors.

- [ ] **Step 4: Confirm SQL Server reachable**

  The connection string in `appsettings.json` points to `Server=DESKTOP-4HDR1PF;Database=ClinicalApplicationDB;Trusted_Connection=True;`.

  If that server is not reachable from the dev machine, update `appsettings.Development.json` with a working local SQL Server / LocalDB / Docker SQL Server connection string before continuing. Example using LocalDB:

  ```json
  {
    "ConnectionStrings": {
      "ClinicalApplicationDBCon": "Server=(localdb)\\MSSQLLocalDB;Database=ClinicalApplicationDB;Trusted_Connection=True;TrustServerCertificate=True;"
    }
  }
  ```

  No commit yet — `appsettings.Development.json` is environment-specific.

---

## Phase 1 — Foundation: packages, config, enums, auth primitives

### Task 1: Add NuGet packages

**Files:** Modify `ClinicManagmentAPIs.csproj`.

- [ ] **Step 1: Add the three packages we need**

  Run from the project directory:
  ```bash
  dotnet add package BCrypt.Net-Next --version 4.0.3
  dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 10.0.0
  ```

- [ ] **Step 2: Verify build still works**

  Run: `dotnet build`
  Expected: 0 errors. `ClinicManagmentAPIs.csproj` now lists both new `PackageReference` lines.

### Task 2: Add JWT config to appsettings

**Files:** Modify `appsettings.json`, `appsettings.Development.json`.

- [ ] **Step 1: Add a `Jwt` section to `appsettings.json`**

  Add this block at the top level (next to `ConnectionStrings`):

  ```json
  "Jwt": {
    "Key": "REPLACE_WITH_AT_LEAST_32_CHAR_SECRET_FROM_USER_SECRETS",
    "Issuer": "ClinicManagmentAPIs",
    "Audience": "ClinicManagmentAPIs.Client",
    "ExpiryHours": 8
  }
  ```

- [ ] **Step 2: Add a dev key to `appsettings.Development.json`**

  ```json
  {
    "Jwt": {
      "Key": "dev-only-secret-please-change-me-this-is-32-bytes-min"
    }
  }
  ```

  (The dev file overrides only `Jwt:Key` — other fields inherit from `appsettings.json`.)

### Task 3: Add enum types in `Common/`

**Files:**
- Create: `Common/EmployeeType.cs`
- Create: `Common/AppointmentStatus.cs`
- Create: `Common/AppointmentType.cs`
- Create: `Common/InvoiceStatus.cs`
- Create: `Common/PaymentMethod.cs`
- Create: `Common/AuditAction.cs`

- [ ] **Step 1: `Common/EmployeeType.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.Common;

  public enum EmployeeType
  {
      Doctor,
      Staff,
      Admin
  }
  ```

- [ ] **Step 2: `Common/AppointmentStatus.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.Common;

  public enum AppointmentStatus
  {
      Scheduled,
      CheckedIn,
      Completed,
      Cancelled,
      NoShow
  }
  ```

- [ ] **Step 3: `Common/AppointmentType.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.Common;

  public enum AppointmentType
  {
      New,
      FollowUp
  }
  ```

- [ ] **Step 4: `Common/InvoiceStatus.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.Common;

  public enum InvoiceStatus
  {
      Draft,
      Sent,
      Paid,
      Void
  }
  ```

- [ ] **Step 5: `Common/PaymentMethod.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.Common;

  public enum PaymentMethod
  {
      Cash,
      Card,
      Insurance
  }
  ```

- [ ] **Step 6: `Common/AuditAction.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.Common;

  public enum AuditAction
  {
      Insert,
      Update,
      Delete,
      Login
  }
  ```

- [ ] **Step 7: Build**

  Run: `dotnet build`
  Expected: 0 errors.

### Task 4: Add auth primitives

**Files:**
- Create: `Auth/IPasswordHasher.cs`
- Create: `Auth/PasswordHasher.cs`
- Create: `Auth/IJwtTokenService.cs`
- Create: `Auth/JwtTokenService.cs`
- Create: `Auth/ICurrentUser.cs`
- Create: `Auth/CurrentUser.cs`
- Create: `Auth/JwtSettings.cs`

- [ ] **Step 1: `Auth/JwtSettings.cs`** — strongly-typed options binding

  ```csharp
  namespace ClinicManagmentAPIs.Auth;

  public class JwtSettings
  {
      public string Key { get; set; } = string.Empty;
      public string Issuer { get; set; } = string.Empty;
      public string Audience { get; set; } = string.Empty;
      public int ExpiryHours { get; set; } = 8;
  }
  ```

- [ ] **Step 2: `Auth/IPasswordHasher.cs` + `Auth/PasswordHasher.cs`**

  ```csharp
  // Auth/IPasswordHasher.cs
  namespace ClinicManagmentAPIs.Auth;

  public interface IPasswordHasher
  {
      string Hash(string password);
      bool Verify(string password, string hash);
  }
  ```

  ```csharp
  // Auth/PasswordHasher.cs
  namespace ClinicManagmentAPIs.Auth;

  public class PasswordHasher : IPasswordHasher
  {
      public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);
      public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
  }
  ```

- [ ] **Step 3: `Auth/IJwtTokenService.cs` + `Auth/JwtTokenService.cs`**

  ```csharp
  // Auth/IJwtTokenService.cs
  using ClinicManagmentAPIs.Model;

  namespace ClinicManagmentAPIs.Auth;

  public record IssuedToken(string AccessToken, DateTime ExpiresAt);

  public interface IJwtTokenService
  {
      IssuedToken Issue(UserAccount user);
  }
  ```

  ```csharp
  // Auth/JwtTokenService.cs
  using System.IdentityModel.Tokens.Jwt;
  using System.Security.Claims;
  using System.Text;
  using ClinicManagmentAPIs.Model;
  using Microsoft.Extensions.Options;
  using Microsoft.IdentityModel.Tokens;

  namespace ClinicManagmentAPIs.Auth;

  public class JwtTokenService : IJwtTokenService
  {
      private readonly JwtSettings _settings;

      public JwtTokenService(IOptions<JwtSettings> options) => _settings = options.Value;

      public IssuedToken Issue(UserAccount user)
      {
          var expires = DateTime.UtcNow.AddHours(_settings.ExpiryHours);

          var claims = new List<Claim>
          {
              new(JwtRegisteredClaimNames.Sub, user.user_id.ToString()),
              new(ClaimTypes.NameIdentifier, user.user_id.ToString()),
              new(ClaimTypes.Name, user.username ?? string.Empty),
              new(ClaimTypes.Role, user.employee_type.ToString())
          };
          if (user.doctor_id_FK is int docId)
              claims.Add(new Claim("doctor_id", docId.ToString()));

          var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
          var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

          var token = new JwtSecurityToken(
              issuer: _settings.Issuer,
              audience: _settings.Audience,
              claims: claims,
              expires: expires,
              signingCredentials: creds);

          var jwt = new JwtSecurityTokenHandler().WriteToken(token);
          return new IssuedToken(jwt, expires);
      }
  }
  ```

- [ ] **Step 4: `Auth/ICurrentUser.cs` + `Auth/CurrentUser.cs`**

  ```csharp
  // Auth/ICurrentUser.cs
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Auth;

  public interface ICurrentUser
  {
      int UserId { get; }
      EmployeeType EmployeeType { get; }
      int? DoctorId { get; }
      bool IsAdmin { get; }
      bool IsDoctor { get; }
      bool IsStaff { get; }
      bool IsAuthenticated { get; }
  }
  ```

  ```csharp
  // Auth/CurrentUser.cs
  using System.Security.Claims;
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Auth;

  public class CurrentUser : ICurrentUser
  {
      private readonly ClaimsPrincipal _principal;

      public CurrentUser(IHttpContextAccessor accessor)
      {
          _principal = accessor.HttpContext?.User ?? new ClaimsPrincipal();
      }

      public bool IsAuthenticated => _principal.Identity?.IsAuthenticated == true;

      public int UserId => int.Parse(_principal.FindFirstValue(ClaimTypes.NameIdentifier)
          ?? throw new InvalidOperationException("No user_id claim on principal"));

      public EmployeeType EmployeeType => Enum.Parse<EmployeeType>(
          _principal.FindFirstValue(ClaimTypes.Role)
          ?? throw new InvalidOperationException("No role claim on principal"));

      public int? DoctorId
      {
          get
          {
              var raw = _principal.FindFirstValue("doctor_id");
              return string.IsNullOrEmpty(raw) ? null : int.Parse(raw);
          }
      }

      public bool IsAdmin  => EmployeeType == EmployeeType.Admin;
      public bool IsDoctor => EmployeeType == EmployeeType.Doctor;
      public bool IsStaff  => EmployeeType == EmployeeType.Staff;
  }
  ```

- [ ] **Step 5: Build**

  Run: `dotnet build`
  Expected: 0 errors (note — these will compile even though `UserAccount.employee_type` doesn't exist yet, because we modify that entity in Task 7).

  If you see errors about `user.employee_type` not existing, that's fine — proceed to Task 7 which adds it. If you want to stay green, you can temporarily compile after Task 7 instead.

### Task 5: Wire JWT, DI, and Swagger Bearer in `Program.cs`

**Files:** Modify `Program.cs` (rewrite entirely — current file is small).

- [ ] **Step 1: Replace the contents of `Program.cs`**

  ```csharp
  using System.Text;
  using System.Text.Json.Serialization;
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authentication.JwtBearer;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.IdentityModel.Tokens;
  using Microsoft.OpenApi.Models;

  var builder = WebApplication.CreateBuilder(args);

  // ---- Options ----
  builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

  // ---- MVC + JSON enum strings ----
  builder.Services
      .AddControllers()
      .AddJsonOptions(opt =>
      {
          opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
      });

  // ---- EF Core ----
  builder.Services.AddDbContext<DBContext>(options =>
      options.UseSqlServer(builder.Configuration.GetConnectionString("ClinicalApplicationDBCon")));

  // ---- Auth services ----
  builder.Services.AddHttpContextAccessor();
  builder.Services.AddScoped<ICurrentUser, CurrentUser>();
  builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
  builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

  // ---- Domain services (registered as later tasks add them) ----
  builder.Services.AddScoped<IAuthService, AuthService>();
  builder.Services.AddScoped<IAuditLogger, AuditLogger>();
  builder.Services.AddScoped<IUserService, UserService>();
  builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
  builder.Services.AddScoped<IDoctorService, DoctorService>();
  builder.Services.AddScoped<IPatientService, PatientService>();
  builder.Services.AddScoped<IAppointmentService, AppointmentService>();
  builder.Services.AddScoped<IPatientHistoryService, PatientHistoryService>();
  builder.Services.AddScoped<IVitalsService, VitalsService>();
  builder.Services.AddScoped<IInvoiceService, InvoiceService>();
  builder.Services.AddScoped<IPaymentService, PaymentService>();

  // ---- JWT bearer ----
  var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
  builder.Services
      .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
      .AddJwtBearer(options =>
      {
          options.TokenValidationParameters = new TokenValidationParameters
          {
              ValidateIssuer = true,
              ValidateAudience = true,
              ValidateLifetime = true,
              ValidateIssuerSigningKey = true,
              ValidIssuer = jwt.Issuer,
              ValidAudience = jwt.Audience,
              IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
              ClockSkew = TimeSpan.Zero
          };
      });
  builder.Services.AddAuthorization();

  // ---- Swagger w/ Bearer button ----
  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen(c =>
  {
      c.SwaggerDoc("v1", new OpenApiInfo { Title = "Clinic Management API", Version = "v1" });
      c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
      {
          In = ParameterLocation.Header,
          Description = "Paste JWT here (no 'Bearer ' prefix needed in the box).",
          Name = "Authorization",
          Type = SecuritySchemeType.Http,
          Scheme = "bearer",
          BearerFormat = "JWT"
      });
      c.AddSecurityRequirement(new OpenApiSecurityRequirement
      {
          {
              new OpenApiSecurityScheme
              {
                  Reference = new OpenApiReference
                  {
                      Type = ReferenceType.SecurityScheme,
                      Id = "Bearer"
                  }
              },
              Array.Empty<string>()
          }
      });
  });

  var app = builder.Build();

  app.UseSwagger();
  app.UseSwaggerUI();
  app.UseAuthentication();
  app.UseAuthorization();
  app.MapControllers();

  app.Run();
  ```

- [ ] **Step 2: Build**

  Run: `dotnet build`
  Expected: **build will fail** with "type or namespace `IAuthService` (etc.) not found" — these services are added in later tasks. This is expected; we'll get back to green at the end of Phase 3. If you want to keep CI green between tasks, comment out the `AddScoped<IXxxService, XxxService>()` lines and uncomment them as each service is added.

**Commit checkpoint (do NOT commit yet — wait for Phase 2 entity work to land).**

---

## Phase 2 — Data model and migration

### Task 6: Create `Specialty` entity

**Files:** Create `Model/Specialty.cs`.

- [ ] **Step 1: Write the entity**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;

  namespace ClinicManagmentAPIs.Model;

  [Table("Specialty")]
  public class Specialty
  {
      [Key]
      [Column("specialty_id")]
      public int specialty_id { get; set; }

      [Required, StringLength(100)]
      [Column("name")]
      public string name { get; set; } = string.Empty;

      [StringLength(500)]
      [Column("description")]
      public string? description { get; set; }

      public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
  }
  ```

### Task 7: Modify `UserAccount` entity

**Files:** Modify `Model/UserAccount.cs`.

- [ ] **Step 1: Replace the contents of `Model/UserAccount.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Model;

  [Table("UserAccount")]
  public class UserAccount
  {
      [Key]
      [Column("user_id")]
      public int user_id { get; set; }

      [Required, StringLength(50)]
      [Column("username")]
      public string username { get; set; } = string.Empty;

      [Required, StringLength(200)]
      [Column("password_hash")]
      public string password_hash { get; set; } = string.Empty;

      [Required]
      [Column("employee_type")]
      public EmployeeType employee_type { get; set; }

      [Column("doctor_id_FK")]
      public int? doctor_id_FK { get; set; }
      public Doctor? Doctor { get; set; }

      [StringLength(200)]
      [Column("email")]
      public string? email { get; set; }

      [Column("active_flag")]
      public bool active_flag { get; set; } = true;

      [Column("created_at")]
      public DateTime created_at { get; set; } = DateTime.UtcNow;
  }
  ```

### Task 8: Create `Doctor` entity

**Files:** Create `Model/Doctor.cs`.

- [ ] **Step 1: Write the entity**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;

  namespace ClinicManagmentAPIs.Model;

  [Table("Doctor")]
  public class Doctor
  {
      [Key]
      [Column("doctor_id")]
      public int doctor_id { get; set; }

      [Required, StringLength(100)]
      [Column("first_name")]
      public string first_name { get; set; } = string.Empty;

      [Required, StringLength(100)]
      [Column("last_name")]
      public string last_name { get; set; } = string.Empty;

      [Required]
      [Column("specialty_id_FK")]
      public int specialty_id_FK { get; set; }
      public Specialty Specialty { get; set; } = null!;

      [StringLength(30)]
      [Column("phone")]
      public string? phone { get; set; }

      [StringLength(200)]
      [Column("email")]
      public string? email { get; set; }

      [Column("active_flag")]
      public bool active_flag { get; set; } = true;

      [Column("created_at")]
      public DateTime created_at { get; set; } = DateTime.UtcNow;
  }
  ```

### Task 9: Verify `Patient` matches the spec (no changes expected)

**Files:** Inspect `Model/Patient.cs`.

- [ ] **Step 1: Open `Model/Patient.cs` and confirm it already has** these columns: `patient_id`, `mrn`, `first_name`, `last_name`, `date_of_birth`, `sex`, `phone?`, `email?`, `address?`, `created_at`.

  No changes needed if it matches. The plan does not modify Patient.

### Task 10: Create `Appointment` entity

**Files:** Create `Model/Appointment.cs`.

- [ ] **Step 1: Write the entity**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Model;

  [Table("Appointment")]
  public class Appointment
  {
      [Key]
      [Column("appointment_id")]
      public int appointment_id { get; set; }

      [Required]
      [Column("patient_id_FK")]
      public int patient_id_FK { get; set; }
      public Patient Patient { get; set; } = null!;

      [Required]
      [Column("doctor_id_FK")]
      public int doctor_id_FK { get; set; }
      public Doctor Doctor { get; set; } = null!;

      [Required]
      [Column("scheduled_at")]
      public DateTime scheduled_at { get; set; }

      [Required]
      [Column("appointment_type")]
      public AppointmentType appointment_type { get; set; }

      [Required]
      [Column("status")]
      public AppointmentStatus status { get; set; } = AppointmentStatus.Scheduled;

      [StringLength(500)]
      [Column("reason")]
      public string? reason { get; set; }

      [Required]
      [Column("created_by_user_id_FK")]
      public int created_by_user_id_FK { get; set; }
      public UserAccount CreatedBy { get; set; } = null!;

      [Column("created_at")]
      public DateTime created_at { get; set; } = DateTime.UtcNow;
  }
  ```

### Task 11: Create `PatientHistory` entity

**Files:** Create `Model/PatientHistory.cs`.

- [ ] **Step 1: Write the entity**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;

  namespace ClinicManagmentAPIs.Model;

  [Table("PatientHistory")]
  public class PatientHistory
  {
      [Key]
      [Column("history_id")]
      public int history_id { get; set; }

      [Required]
      [Column("patient_id_FK")]
      public int patient_id_FK { get; set; }
      public Patient Patient { get; set; } = null!;

      [Required]
      [Column("doctor_id_FK")]
      public int doctor_id_FK { get; set; }
      public Doctor Doctor { get; set; } = null!;

      [Required]
      [Column("appointment_id_FK")]
      public int appointment_id_FK { get; set; }
      public Appointment Appointment { get; set; } = null!;

      [Required, StringLength(1000)]
      [Column("diagnosis")]
      public string diagnosis { get; set; } = string.Empty;

      [StringLength(4000)]
      [Column("notes")]
      public string? notes { get; set; }

      [StringLength(2000)]
      [Column("prescription")]
      public string? prescription { get; set; }

      [Column("created_at")]
      public DateTime created_at { get; set; } = DateTime.UtcNow;

      [Column("updated_at")]
      public DateTime? updated_at { get; set; }
  }
  ```

### Task 12: Create `Vitals` entity

**Files:** Create `Model/Vitals.cs`.

- [ ] **Step 1: Write the entity**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;

  namespace ClinicManagmentAPIs.Model;

  [Table("Vitals")]
  public class Vitals
  {
      [Key]
      [Column("vitals_id")]
      public int vitals_id { get; set; }

      [Required]
      [Column("appointment_id_FK")]
      public int appointment_id_FK { get; set; }
      public Appointment Appointment { get; set; } = null!;

      [Required]
      [Column("patient_id_FK")]
      public int patient_id_FK { get; set; }
      public Patient Patient { get; set; } = null!;

      [Required]
      [Column("recorded_by_user_id_FK")]
      public int recorded_by_user_id_FK { get; set; }
      public UserAccount RecordedBy { get; set; } = null!;

      [StringLength(20)]
      [Column("blood_pressure")]
      public string? blood_pressure { get; set; }

      [Column("heart_rate")]
      public int? heart_rate { get; set; }

      [Column("temperature", TypeName = "decimal(4,1)")]
      public decimal? temperature { get; set; }

      [Column("weight_kg", TypeName = "decimal(5,2)")]
      public decimal? weight_kg { get; set; }

      [Column("height_cm", TypeName = "decimal(5,2)")]
      public decimal? height_cm { get; set; }

      [Column("recorded_at")]
      public DateTime recorded_at { get; set; } = DateTime.UtcNow;
  }
  ```

### Task 13: Create `Invoice`, `InvoiceLineItem`, `Payment` entities

**Files:** Create `Model/Invoice.cs`, `Model/InvoiceLineItem.cs`, `Model/Payment.cs`.

- [ ] **Step 1: `Model/Invoice.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Model;

  [Table("Invoice")]
  public class Invoice
  {
      [Key]
      [Column("invoice_id")]
      public int invoice_id { get; set; }

      [Required]
      [Column("patient_id_FK")]
      public int patient_id_FK { get; set; }
      public Patient Patient { get; set; } = null!;

      [Column("appointment_id_FK")]
      public int? appointment_id_FK { get; set; }
      public Appointment? Appointment { get; set; }

      [Required]
      [Column("total_amount", TypeName = "decimal(12,2)")]
      public decimal total_amount { get; set; }

      [Required]
      [Column("status")]
      public InvoiceStatus status { get; set; } = InvoiceStatus.Draft;

      [Column("issued_at")]
      public DateTime issued_at { get; set; } = DateTime.UtcNow;

      [Required]
      [Column("created_by_user_id_FK")]
      public int created_by_user_id_FK { get; set; }
      public UserAccount CreatedBy { get; set; } = null!;

      public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
      public ICollection<Payment> Payments { get; set; } = new List<Payment>();
  }
  ```

- [ ] **Step 2: `Model/InvoiceLineItem.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;

  namespace ClinicManagmentAPIs.Model;

  [Table("InvoiceLineItem")]
  public class InvoiceLineItem
  {
      [Key]
      [Column("line_item_id")]
      public int line_item_id { get; set; }

      [Required]
      [Column("invoice_id_FK")]
      public int invoice_id_FK { get; set; }
      public Invoice Invoice { get; set; } = null!;

      [Required, StringLength(500)]
      [Column("description")]
      public string description { get; set; } = string.Empty;

      [Required, Range(1, int.MaxValue)]
      [Column("quantity")]
      public int quantity { get; set; }

      [Required]
      [Column("unit_price", TypeName = "decimal(12,2)")]
      public decimal unit_price { get; set; }

      [Required]
      [Column("line_total", TypeName = "decimal(12,2)")]
      public decimal line_total { get; set; }
  }
  ```

- [ ] **Step 3: `Model/Payment.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Model;

  [Table("Payment")]
  public class Payment
  {
      [Key]
      [Column("payment_id")]
      public int payment_id { get; set; }

      [Required]
      [Column("invoice_id_FK")]
      public int invoice_id_FK { get; set; }
      public Invoice Invoice { get; set; } = null!;

      [Required]
      [Column("amount", TypeName = "decimal(12,2)")]
      public decimal amount { get; set; }

      [Required]
      [Column("method")]
      public PaymentMethod method { get; set; }

      [Required]
      [Column("paid_at")]
      public DateTime paid_at { get; set; }

      [Required]
      [Column("received_by_user_id_FK")]
      public int received_by_user_id_FK { get; set; }
      public UserAccount ReceivedBy { get; set; } = null!;
  }
  ```

### Task 14: Create `AuditLog` entity

**Files:** Create `Model/AuditLog.cs`.

- [ ] **Step 1: Write the entity**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Model;

  [Table("AuditLog")]
  public class AuditLog
  {
      [Key]
      [Column("audit_id")]
      public int audit_id { get; set; }

      [Column("user_id_FK")]
      public int? user_id_FK { get; set; }
      public UserAccount? User { get; set; }

      [Required]
      [Column("action")]
      public AuditAction action { get; set; }

      [StringLength(100)]
      [Column("entity_name")]
      public string? entity_name { get; set; }

      [Column("entity_id")]
      public int? entity_id { get; set; }

      [StringLength(2000)]
      [Column("details")]
      public string? details { get; set; }

      [Column("created_at")]
      public DateTime created_at { get; set; } = DateTime.UtcNow;
  }
  ```

### Task 15: Rewrite `DBContext` with all DbSets and `OnModelCreating`

**Files:** Replace `Data/DBContext.cs` entirely.

- [ ] **Step 1: Replace `Data/DBContext.cs`**

  ```csharp
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
      }
  }
  ```

- [ ] **Step 2: Build (auth + DBContext now stand alone)**

  Run: `dotnet build` (still expect service-not-found errors until later phases).

### Task 16: Seed data + initial migration

**Files:**
- Create: `Data/DbSeeder.cs`
- Generated: `Data/Migrations/*` (via `dotnet ef`)

- [ ] **Step 1: Write `Data/DbSeeder.cs` — admin user + 6 specialties**

  We hash `Admin@123` once and paste the resulting hash so the migration is deterministic and re-running the seed doesn't produce a new hash each time.

  Generate the hash one-off in any C# scratchpad (or temporary console app):

  ```csharp
  Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Admin@123"));
  ```

  Copy the output (`$2a$11$...` ~60 chars) into the seeder.

  ```csharp
  // Data/DbSeeder.cs
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Data;

  public static class DbSeeder
  {
      // PASTE the BCrypt hash of "Admin@123" here:
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
  ```

- [ ] **Step 2: Call the seeder from `OnModelCreating`**

  Open `Data/DBContext.cs` and add **at the end of `OnModelCreating`** (after all the entity config):

  ```csharp
          // Seed data
          DbSeeder.Apply(b);
  ```

- [ ] **Step 3: Generate the initial migration**

  Run from the project directory:
  ```bash
  dotnet ef migrations add InitialCreate -o Data/Migrations
  ```
  Expected: a new folder `Data/Migrations/` with `*_InitialCreate.cs`, `*_InitialCreate.Designer.cs`, and `DBContextModelSnapshot.cs`.

- [ ] **Step 4: Apply the migration**

  Run:
  ```bash
  dotnet ef database update
  ```
  Expected: tables created, seed rows inserted. If the DB already had a `Patient` table from prior work, expect an error about an existing object — in that case **drop the database first**:
  ```bash
  dotnet ef database drop --force
  dotnet ef database update
  ```

- [ ] **Step 5: Verify seed**

  Run via SSMS / sqlcmd:
  ```sql
  SELECT specialty_id, name FROM Specialty ORDER BY specialty_id;
  SELECT user_id, username, employee_type, active_flag FROM UserAccount;
  ```
  Expected: 6 specialties, 1 admin user with `employee_type='Admin'`.

**Commit checkpoint:** schema + seed done. Suggested message:
```
Add EF code-first model, migration, and admin/specialty seed for clinic backend.
```

---

## Phase 3 — Auth, audit logging, login endpoint

### Task 17: `IAuditLogger` and `AuditLogger`

**Files:**
- Create: `Services/IAuditLogger.cs`
- Create: `Services/AuditLogger.cs`

- [ ] **Step 1: `Services/IAuditLogger.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.Services;

  public interface IAuditLogger
  {
      Task LogAsync(AuditAction action, string? entityName, int? entityId, string? details = null);
      Task LogLoginAsync(int? userId, string usernameAttempted, bool success);
  }
  ```

- [ ] **Step 2: `Services/AuditLogger.cs`**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.Model;

  namespace ClinicManagmentAPIs.Services;

  public class AuditLogger : IAuditLogger
  {
      private readonly DBContext _db;
      private readonly ICurrentUser _currentUser;

      public AuditLogger(DBContext db, ICurrentUser currentUser)
      {
          _db = db;
          _currentUser = currentUser;
      }

      public async Task LogAsync(AuditAction action, string? entityName, int? entityId, string? details = null)
      {
          _db.AuditLogs.Add(new AuditLog
          {
              user_id_FK = _currentUser.IsAuthenticated ? _currentUser.UserId : null,
              action = action,
              entity_name = entityName,
              entity_id = entityId,
              details = details,
              created_at = DateTime.UtcNow
          });
          await _db.SaveChangesAsync();
      }

      public async Task LogLoginAsync(int? userId, string usernameAttempted, bool success)
      {
          _db.AuditLogs.Add(new AuditLog
          {
              user_id_FK = userId,
              action = AuditAction.Login,
              entity_name = null,
              entity_id = null,
              details = success ? $"login_success:{usernameAttempted}" : $"login_failure:{usernameAttempted}",
              created_at = DateTime.UtcNow
          });
          await _db.SaveChangesAsync();
      }
  }
  ```

### Task 18: Auth DTOs + `AuthService` + `AuthController`

**Files:**
- Create: `DTOs/Auth/LoginRequest.cs`
- Create: `DTOs/Auth/LoginResponse.cs`
- Create: `Services/IAuthService.cs`
- Create: `Services/AuthService.cs`
- Create: `Controllers/AuthController.cs`

- [ ] **Step 1: `DTOs/Auth/LoginRequest.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;

  namespace ClinicManagmentAPIs.DTOs.Auth;

  public class LoginRequest
  {
      [Required, StringLength(50)]
      public string username { get; set; } = string.Empty;

      [Required, StringLength(200)]
      public string password { get; set; } = string.Empty;
  }
  ```

- [ ] **Step 2: `DTOs/Auth/LoginResponse.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.DTOs.Auth;

  public class LoginResponse
  {
      public string access_token { get; set; } = string.Empty;
      public DateTime expires_at { get; set; }
      public UserSummary user { get; set; } = null!;
  }

  public class UserSummary
  {
      public int user_id { get; set; }
      public string username { get; set; } = string.Empty;
      public EmployeeType employee_type { get; set; }
      public int? doctor_id { get; set; }
  }
  ```

- [ ] **Step 3: `Services/IAuthService.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Auth;

  namespace ClinicManagmentAPIs.Services;

  public interface IAuthService
  {
      Task<LoginResponse?> LoginAsync(LoginRequest request);
  }
  ```

- [ ] **Step 4: `Services/AuthService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Auth;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class AuthService : IAuthService
  {
      private readonly DBContext _db;
      private readonly IPasswordHasher _hasher;
      private readonly IJwtTokenService _tokens;
      private readonly IAuditLogger _audit;

      public AuthService(DBContext db, IPasswordHasher hasher, IJwtTokenService tokens, IAuditLogger audit)
      {
          _db = db;
          _hasher = hasher;
          _tokens = tokens;
          _audit = audit;
      }

      public async Task<LoginResponse?> LoginAsync(LoginRequest request)
      {
          var user = await _db.Users.FirstOrDefaultAsync(u => u.username == request.username);
          if (user is null || !user.active_flag || !_hasher.Verify(request.password, user.password_hash))
          {
              await _audit.LogLoginAsync(user?.user_id, request.username, success: false);
              return null;
          }

          var issued = _tokens.Issue(user);
          await _audit.LogLoginAsync(user.user_id, request.username, success: true);

          return new LoginResponse
          {
              access_token = issued.AccessToken,
              expires_at = issued.ExpiresAt,
              user = new UserSummary
              {
                  user_id = user.user_id,
                  username = user.username,
                  employee_type = user.employee_type,
                  doctor_id = user.doctor_id_FK
              }
          };
      }
  }
  ```

- [ ] **Step 5: `Controllers/AuthController.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Auth;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/auth")]
  [ApiController]
  public class AuthController : ControllerBase
  {
      private readonly IAuthService _auth;
      public AuthController(IAuthService auth) => _auth = auth;

      [HttpPost("login")]
      public async Task<IActionResult> Login([FromBody] LoginRequest request)
      {
          var result = await _auth.LoginAsync(request);
          if (result is null) return Unauthorized(new { message = "Invalid username or password." });
          return Ok(result);
      }
  }
  ```

- [ ] **Step 6: Build**

  Run: `dotnet build`
  Expected: still errors about other services not yet implemented. Continue.

### Task 19: Verify login

**Files:** none (manual verification).

- [ ] **Step 1: Temporarily comment out service registrations not yet implemented**

  In `Program.cs`, leave registered: `IAuthService`, `IAuditLogger`, `ICurrentUser`, `IPasswordHasher`, `IJwtTokenService`. **Comment out** the lines for `IUserService`, `ISpecialtyService`, `IDoctorService`, `IPatientService`, `IAppointmentService`, `IPatientHistoryService`, `IVitalsService`, `IInvoiceService`, `IPaymentService` — we'll uncomment as each task lands.

- [ ] **Step 2: Run the app**

  Run: `dotnet run`
  Expected: app listens on `http://localhost:<port>`; Swagger UI at `/swagger`.

- [ ] **Step 3: Login as admin via Swagger or curl**

  ```bash
  curl -s -X POST http://localhost:<port>/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Admin@123"}'
  ```
  Expected: JSON response with `access_token`, `expires_at`, and `user.employee_type = "Admin"`.

- [ ] **Step 4: Verify audit log**

  ```sql
  SELECT TOP 5 audit_id, user_id_FK, action, details, created_at FROM AuditLog ORDER BY audit_id DESC;
  ```
  Expected: one row with `action='Login'` and `details='login_success:admin'`.

- [ ] **Step 5: Negative test**

  ```bash
  curl -s -X POST http://localhost:<port>/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
  ```
  Expected: `401 Unauthorized` with `{"message":"Invalid username or password."}`. AuditLog gains a `login_failure:admin` row.

**Commit checkpoint:** auth foundation works. Suggested message:
```
Add JWT login, password hashing, audit logger, and AuthController.
```

---

## Phase 4 — User management (Admin only)

### Task 20: Common DTOs + paged response + error response

**Files:**
- Create: `DTOs/Common/PagedResponse.cs`
- Create: `DTOs/Common/ErrorResponse.cs`

- [ ] **Step 1: `DTOs/Common/PagedResponse.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.DTOs.Common;

  public class PagedResponse<T>
  {
      public IReadOnlyList<T> items { get; set; } = Array.Empty<T>();
      public int total { get; set; }
      public int page { get; set; }
      public int pageSize { get; set; }
  }
  ```

- [ ] **Step 2: `DTOs/Common/ErrorResponse.cs`**

  ```csharp
  namespace ClinicManagmentAPIs.DTOs.Common;

  public class ErrorResponse
  {
      public int status { get; set; }
      public string message { get; set; } = string.Empty;
      public IReadOnlyList<string> errors { get; set; } = Array.Empty<string>();

      public static ErrorResponse Of(int status, string message, IEnumerable<string>? errors = null)
          => new() { status = status, message = message, errors = errors?.ToArray() ?? Array.Empty<string>() };
  }
  ```

### Task 21: User DTOs + `IUserService` + `UserService`

**Files:**
- Create: `DTOs/User/CreateUserRequest.cs`
- Create: `DTOs/User/CreateDoctorPart.cs`
- Create: `DTOs/User/UpdateUserActiveRequest.cs`
- Create: `DTOs/User/ResetPasswordRequest.cs`
- Create: `DTOs/User/UserResponse.cs`
- Create: `Services/IUserService.cs`
- Create: `Services/UserService.cs`

- [ ] **Step 1: `DTOs/User/CreateUserRequest.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.DTOs.User;

  public class CreateUserRequest
  {
      [Required, StringLength(50)]
      public string username { get; set; } = string.Empty;

      [Required, StringLength(200, MinimumLength = 6)]
      public string password { get; set; } = string.Empty;

      [Required]
      public EmployeeType employee_type { get; set; }

      [EmailAddress, StringLength(200)]
      public string? email { get; set; }

      // Required only when employee_type == Doctor
      public CreateDoctorPart? doctor { get; set; }
  }
  ```

- [ ] **Step 2: `DTOs/User/CreateDoctorPart.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;

  namespace ClinicManagmentAPIs.DTOs.User;

  public class CreateDoctorPart
  {
      [Required, StringLength(100)]
      public string first_name { get; set; } = string.Empty;
      [Required, StringLength(100)]
      public string last_name { get; set; } = string.Empty;
      [Required]
      public int specialty_id { get; set; }
      [StringLength(30)]
      public string? phone { get; set; }
      [EmailAddress, StringLength(200)]
      public string? email { get; set; }
  }
  ```

- [ ] **Step 3: `DTOs/User/UpdateUserActiveRequest.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;

  namespace ClinicManagmentAPIs.DTOs.User;

  public class UpdateUserActiveRequest
  {
      [Required]
      public bool active_flag { get; set; }
  }
  ```

- [ ] **Step 4: `DTOs/User/ResetPasswordRequest.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;

  namespace ClinicManagmentAPIs.DTOs.User;

  public class ResetPasswordRequest
  {
      [Required, StringLength(200, MinimumLength = 6)]
      public string new_password { get; set; } = string.Empty;
  }
  ```

- [ ] **Step 5: `DTOs/User/UserResponse.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;

  namespace ClinicManagmentAPIs.DTOs.User;

  public class UserResponse
  {
      public int user_id { get; set; }
      public string username { get; set; } = string.Empty;
      public EmployeeType employee_type { get; set; }
      public int? doctor_id { get; set; }
      public string? email { get; set; }
      public bool active_flag { get; set; }
      public DateTime created_at { get; set; }
  }
  ```

- [ ] **Step 6: `Services/IUserService.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.User;

  namespace ClinicManagmentAPIs.Services;

  public interface IUserService
  {
      Task<UserResponse> CreateAsync(CreateUserRequest request);
      Task<UserResponse?> GetAsync(int id);
      Task<IReadOnlyList<UserResponse>> ListAsync();
      Task<UserResponse?> SetActiveAsync(int id, bool active);
      Task<bool> ResetPasswordAsync(int id, string newPassword);
  }
  ```

- [ ] **Step 7: `Services/UserService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.User;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class UserService : IUserService
  {
      private readonly DBContext _db;
      private readonly IPasswordHasher _hasher;
      private readonly IAuditLogger _audit;

      public UserService(DBContext db, IPasswordHasher hasher, IAuditLogger audit)
      {
          _db = db;
          _hasher = hasher;
          _audit = audit;
      }

      public async Task<UserResponse> CreateAsync(CreateUserRequest req)
      {
          if (await _db.Users.AnyAsync(u => u.username == req.username))
              throw new InvalidOperationException("Username already taken.");

          if (req.employee_type == EmployeeType.Doctor && req.doctor is null)
              throw new InvalidOperationException("Doctor details required for Doctor employee_type.");
          if (req.employee_type != EmployeeType.Doctor && req.doctor is not null)
              throw new InvalidOperationException("Doctor details only allowed for Doctor employee_type.");

          await using var tx = await _db.Database.BeginTransactionAsync();

          int? doctorId = null;
          if (req.employee_type == EmployeeType.Doctor)
          {
              var specialty = await _db.Specialties.FirstOrDefaultAsync(s => s.specialty_id == req.doctor!.specialty_id)
                  ?? throw new InvalidOperationException("Specialty not found.");

              var doctor = new Doctor
              {
                  first_name = req.doctor!.first_name,
                  last_name = req.doctor.last_name,
                  specialty_id_FK = specialty.specialty_id,
                  phone = req.doctor.phone,
                  email = req.doctor.email,
                  active_flag = true
              };
              _db.Doctors.Add(doctor);
              await _db.SaveChangesAsync();
              doctorId = doctor.doctor_id;
          }

          var user = new UserAccount
          {
              username = req.username,
              password_hash = _hasher.Hash(req.password),
              employee_type = req.employee_type,
              doctor_id_FK = doctorId,
              email = req.email,
              active_flag = true,
              created_at = DateTime.UtcNow
          };
          _db.Users.Add(user);
          await _db.SaveChangesAsync();
          await tx.CommitAsync();

          await _audit.LogAsync(AuditAction.Insert, "UserAccount", user.user_id);

          return ToResponse(user);
      }

      public async Task<UserResponse?> GetAsync(int id)
      {
          var user = await _db.Users.FirstOrDefaultAsync(u => u.user_id == id);
          return user is null ? null : ToResponse(user);
      }

      public async Task<IReadOnlyList<UserResponse>> ListAsync()
      {
          var users = await _db.Users.OrderBy(u => u.user_id).ToListAsync();
          return users.Select(ToResponse).ToList();
      }

      public async Task<UserResponse?> SetActiveAsync(int id, bool active)
      {
          var user = await _db.Users.FirstOrDefaultAsync(u => u.user_id == id);
          if (user is null) return null;
          user.active_flag = active;
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "UserAccount", user.user_id, $"active_flag={active}");
          return ToResponse(user);
      }

      public async Task<bool> ResetPasswordAsync(int id, string newPassword)
      {
          var user = await _db.Users.FirstOrDefaultAsync(u => u.user_id == id);
          if (user is null) return false;
          user.password_hash = _hasher.Hash(newPassword);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "UserAccount", user.user_id, "password_reset");
          return true;
      }

      private static UserResponse ToResponse(UserAccount u) => new()
      {
          user_id = u.user_id,
          username = u.username,
          employee_type = u.employee_type,
          doctor_id = u.doctor_id_FK,
          email = u.email,
          active_flag = u.active_flag,
          created_at = u.created_at
      };
  }
  ```

### Task 22: `UsersController`

**Files:** Create `Controllers/UsersController.cs`.

- [ ] **Step 1: Write the controller**

  ```csharp
  using ClinicManagmentAPIs.DTOs.User;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/users")]
  [ApiController]
  [Authorize(Roles = "Admin")]
  public class UsersController : ControllerBase
  {
      private readonly IUserService _users;
      public UsersController(IUserService users) => _users = users;

      [HttpGet]
      public async Task<IActionResult> List() => Ok(await _users.ListAsync());

      [HttpGet("{id:int}")]
      public async Task<IActionResult> Get(int id)
      {
          var u = await _users.GetAsync(id);
          return u is null ? NotFound(new { message = "User not found." }) : Ok(u);
      }

      [HttpPost]
      public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
      {
          try
          {
              var created = await _users.CreateAsync(request);
              return CreatedAtAction(nameof(Get), new { id = created.user_id }, created);
          }
          catch (InvalidOperationException ex)
          {
              return Conflict(new { message = ex.Message });
          }
      }

      [HttpPut("{id:int}/active")]
      public async Task<IActionResult> SetActive(int id, [FromBody] UpdateUserActiveRequest request)
      {
          var updated = await _users.SetActiveAsync(id, request.active_flag);
          return updated is null ? NotFound(new { message = "User not found." }) : Ok(updated);
      }

      [HttpPut("{id:int}/password")]
      public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
      {
          var ok = await _users.ResetPasswordAsync(id, request.new_password);
          return ok ? NoContent() : NotFound(new { message = "User not found." });
      }
  }
  ```

- [ ] **Step 2: Uncomment `IUserService` registration in `Program.cs`** and `dotnet build`.

### Task 23: Verify user management

- [ ] **Step 1: Log in as admin (Task 19 procedure) and capture the token.**
- [ ] **Step 2: Create a Doctor user**

  ```bash
  TOKEN="<paste-token>"
  curl -s -X POST http://localhost:<port>/api/users \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{
      "username":"drsmith",
      "password":"Doctor@1",
      "employee_type":"Doctor",
      "email":"drsmith@clinic.local",
      "doctor": { "first_name":"Jane", "last_name":"Smith", "specialty_id":1, "phone":"+201234" }
    }'
  ```
  Expected: `201 Created`. SQL check: `SELECT user_id, doctor_id_FK, employee_type FROM UserAccount WHERE username='drsmith';` — `employee_type='Doctor'`, `doctor_id_FK` not null. `SELECT * FROM Doctor;` shows the new doctor.

- [ ] **Step 3: Create a Staff user**

  ```bash
  curl -s -X POST http://localhost:<port>/api/users \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"username":"recept1","password":"Staff@1","employee_type":"Staff","email":"recept1@clinic.local"}'
  ```
  Expected: `201`. `doctor_id_FK` is null.

- [ ] **Step 4: Negative tests**

  - Duplicate username → `409 Conflict`.
  - Same call without bearer → `401 Unauthorized`.
  - Call as the new Staff user (after logging in as them) → `403 Forbidden`.

**Maps to spec acceptance criteria #3** — admin adds doctor/staff, doctor can immediately log in.

**Commit checkpoint:** suggested message: `Add admin-only user/doctor creation with role gates.`

---

## Phase 5 — Specialty & Doctor controllers

### Task 24: Specialty service + controller

**Files:**
- Create: `DTOs/Specialty/CreateSpecialtyRequest.cs`
- Create: `DTOs/Specialty/UpdateSpecialtyRequest.cs`
- Create: `DTOs/Specialty/SpecialtyResponse.cs`
- Create: `Services/ISpecialtyService.cs`
- Create: `Services/SpecialtyService.cs`
- Create: `Controllers/SpecialtiesController.cs`

- [ ] **Step 1: DTOs**

  ```csharp
  // DTOs/Specialty/CreateSpecialtyRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Specialty;
  public class CreateSpecialtyRequest
  {
      [Required, StringLength(100)]
      public string name { get; set; } = string.Empty;
      [StringLength(500)]
      public string? description { get; set; }
  }
  ```

  ```csharp
  // DTOs/Specialty/UpdateSpecialtyRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Specialty;
  public class UpdateSpecialtyRequest
  {
      [Required, StringLength(100)]
      public string name { get; set; } = string.Empty;
      [StringLength(500)]
      public string? description { get; set; }
  }
  ```

  ```csharp
  // DTOs/Specialty/SpecialtyResponse.cs
  namespace ClinicManagmentAPIs.DTOs.Specialty;
  public class SpecialtyResponse
  {
      public int specialty_id { get; set; }
      public string name { get; set; } = string.Empty;
      public string? description { get; set; }
  }
  ```

- [ ] **Step 2: `Services/ISpecialtyService.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Specialty;
  namespace ClinicManagmentAPIs.Services;
  public interface ISpecialtyService
  {
      Task<IReadOnlyList<SpecialtyResponse>> ListAsync();
      Task<SpecialtyResponse?> GetAsync(int id);
      Task<SpecialtyResponse> CreateAsync(CreateSpecialtyRequest request);
      Task<SpecialtyResponse?> UpdateAsync(int id, UpdateSpecialtyRequest request);
      Task<bool> DeleteAsync(int id);
  }
  ```

- [ ] **Step 3: `Services/SpecialtyService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Specialty;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class SpecialtyService : ISpecialtyService
  {
      private readonly DBContext _db;
      private readonly IAuditLogger _audit;
      public SpecialtyService(DBContext db, IAuditLogger audit) { _db = db; _audit = audit; }

      public async Task<IReadOnlyList<SpecialtyResponse>> ListAsync() =>
          await _db.Specialties.OrderBy(s => s.name)
              .Select(s => new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description })
              .ToListAsync();

      public async Task<SpecialtyResponse?> GetAsync(int id)
      {
          var s = await _db.Specialties.FirstOrDefaultAsync(x => x.specialty_id == id);
          return s is null ? null : new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description };
      }

      public async Task<SpecialtyResponse> CreateAsync(CreateSpecialtyRequest req)
      {
          if (await _db.Specialties.AnyAsync(s => s.name == req.name))
              throw new InvalidOperationException("Specialty name already exists.");
          var s = new Specialty { name = req.name, description = req.description };
          _db.Specialties.Add(s);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Insert, "Specialty", s.specialty_id);
          return new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description };
      }

      public async Task<SpecialtyResponse?> UpdateAsync(int id, UpdateSpecialtyRequest req)
      {
          var s = await _db.Specialties.FirstOrDefaultAsync(x => x.specialty_id == id);
          if (s is null) return null;
          if (await _db.Specialties.AnyAsync(x => x.name == req.name && x.specialty_id != id))
              throw new InvalidOperationException("Specialty name already exists.");
          s.name = req.name;
          s.description = req.description;
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "Specialty", s.specialty_id);
          return new SpecialtyResponse { specialty_id = s.specialty_id, name = s.name, description = s.description };
      }

      public async Task<bool> DeleteAsync(int id)
      {
          var s = await _db.Specialties.FirstOrDefaultAsync(x => x.specialty_id == id);
          if (s is null) return false;
          if (await _db.Doctors.AnyAsync(d => d.specialty_id_FK == id))
              throw new InvalidOperationException("Specialty has doctors assigned; cannot delete.");
          _db.Specialties.Remove(s);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Delete, "Specialty", id);
          return true;
      }
  }
  ```

- [ ] **Step 4: `Controllers/SpecialtiesController.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Specialty;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/specialties")]
  [ApiController]
  [Authorize] // any authenticated user can read
  public class SpecialtiesController : ControllerBase
  {
      private readonly ISpecialtyService _svc;
      public SpecialtiesController(ISpecialtyService svc) => _svc = svc;

      [HttpGet]
      public async Task<IActionResult> List() => Ok(await _svc.ListAsync());

      [HttpGet("{id:int}")]
      public async Task<IActionResult> Get(int id)
      {
          var s = await _svc.GetAsync(id);
          return s is null ? NotFound() : Ok(s);
      }

      [HttpPost]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Create([FromBody] CreateSpecialtyRequest request)
      {
          try
          {
              var created = await _svc.CreateAsync(request);
              return CreatedAtAction(nameof(Get), new { id = created.specialty_id }, created);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpPut("{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Update(int id, [FromBody] UpdateSpecialtyRequest request)
      {
          try
          {
              var updated = await _svc.UpdateAsync(id, request);
              return updated is null ? NotFound() : Ok(updated);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpDelete("{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Delete(int id)
      {
          try
          {
              var ok = await _svc.DeleteAsync(id);
              return ok ? NoContent() : NotFound();
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }
  }
  ```

- [ ] **Step 5: Uncomment `ISpecialtyService` registration in `Program.cs`, build, run.**

### Task 25: Doctor service + controller

**Files:**
- Create: `DTOs/Doctor/UpdateDoctorRequest.cs`
- Create: `DTOs/Doctor/DoctorResponse.cs`
- Create: `Services/IDoctorService.cs`
- Create: `Services/DoctorService.cs`
- Create: `Controllers/DoctorsController.cs`

- [ ] **Step 1: DTOs**

  ```csharp
  // DTOs/Doctor/UpdateDoctorRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Doctor;
  public class UpdateDoctorRequest
  {
      [Required, StringLength(100)] public string first_name { get; set; } = string.Empty;
      [Required, StringLength(100)] public string last_name { get; set; } = string.Empty;
      [Required] public int specialty_id { get; set; }
      [StringLength(30)] public string? phone { get; set; }
      [EmailAddress, StringLength(200)] public string? email { get; set; }
      [Required] public bool active_flag { get; set; }
  }
  ```

  ```csharp
  // DTOs/Doctor/DoctorResponse.cs
  namespace ClinicManagmentAPIs.DTOs.Doctor;
  public class DoctorResponse
  {
      public int doctor_id { get; set; }
      public string first_name { get; set; } = string.Empty;
      public string last_name { get; set; } = string.Empty;
      public int specialty_id { get; set; }
      public string specialty_name { get; set; } = string.Empty;
      public string? phone { get; set; }
      public string? email { get; set; }
      public bool active_flag { get; set; }
  }
  ```

- [ ] **Step 2: `Services/IDoctorService.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Doctor;
  namespace ClinicManagmentAPIs.Services;
  public interface IDoctorService
  {
      Task<IReadOnlyList<DoctorResponse>> ListAsync(int? specialtyId, bool? active);
      Task<DoctorResponse?> GetAsync(int id);
      Task<DoctorResponse?> UpdateAsync(int id, UpdateDoctorRequest request);
      Task<bool> DeleteAsync(int id);
  }
  ```

- [ ] **Step 3: `Services/DoctorService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Doctor;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class DoctorService : IDoctorService
  {
      private readonly DBContext _db;
      private readonly IAuditLogger _audit;
      public DoctorService(DBContext db, IAuditLogger audit) { _db = db; _audit = audit; }

      public async Task<IReadOnlyList<DoctorResponse>> ListAsync(int? specialtyId, bool? active)
      {
          var q = _db.Doctors.Include(d => d.Specialty).AsQueryable();
          if (specialtyId is int s) q = q.Where(d => d.specialty_id_FK == s);
          if (active is bool a) q = q.Where(d => d.active_flag == a);
          return await q.OrderBy(d => d.last_name)
              .Select(d => Map(d))
              .ToListAsync();
      }

      public async Task<DoctorResponse?> GetAsync(int id)
      {
          var d = await _db.Doctors.Include(x => x.Specialty).FirstOrDefaultAsync(x => x.doctor_id == id);
          return d is null ? null : Map(d);
      }

      public async Task<DoctorResponse?> UpdateAsync(int id, UpdateDoctorRequest req)
      {
          var d = await _db.Doctors.Include(x => x.Specialty).FirstOrDefaultAsync(x => x.doctor_id == id);
          if (d is null) return null;
          if (!await _db.Specialties.AnyAsync(s => s.specialty_id == req.specialty_id))
              throw new InvalidOperationException("Specialty not found.");

          d.first_name = req.first_name;
          d.last_name = req.last_name;
          d.specialty_id_FK = req.specialty_id;
          d.phone = req.phone;
          d.email = req.email;
          d.active_flag = req.active_flag;

          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "Doctor", d.doctor_id);

          // re-read specialty
          d = await _db.Doctors.Include(x => x.Specialty).FirstAsync(x => x.doctor_id == id);
          return Map(d);
      }

      public async Task<bool> DeleteAsync(int id)
      {
          var d = await _db.Doctors.FirstOrDefaultAsync(x => x.doctor_id == id);
          if (d is null) return false;
          if (await _db.Appointments.AnyAsync(a => a.doctor_id_FK == id))
              throw new InvalidOperationException("Doctor has appointments; cannot delete.");

          await using var tx = await _db.Database.BeginTransactionAsync();

          // Also disable the linked UserAccount, if any
          var linkedUser = await _db.Users.FirstOrDefaultAsync(u => u.doctor_id_FK == id);
          if (linkedUser is not null) linkedUser.active_flag = false;

          _db.Doctors.Remove(d);
          await _db.SaveChangesAsync();
          await tx.CommitAsync();
          await _audit.LogAsync(AuditAction.Delete, "Doctor", id);
          return true;
      }

      private static DoctorResponse Map(ClinicManagmentAPIs.Model.Doctor d) => new()
      {
          doctor_id = d.doctor_id,
          first_name = d.first_name,
          last_name = d.last_name,
          specialty_id = d.specialty_id_FK,
          specialty_name = d.Specialty?.name ?? string.Empty,
          phone = d.phone,
          email = d.email,
          active_flag = d.active_flag
      };
  }
  ```

- [ ] **Step 4: `Controllers/DoctorsController.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Doctor;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/doctors")]
  [ApiController]
  [Authorize]
  public class DoctorsController : ControllerBase
  {
      private readonly IDoctorService _svc;
      public DoctorsController(IDoctorService svc) => _svc = svc;

      [HttpGet]
      public async Task<IActionResult> List([FromQuery] int? specialty_id, [FromQuery] bool? active) =>
          Ok(await _svc.ListAsync(specialty_id, active));

      [HttpGet("{id:int}")]
      public async Task<IActionResult> Get(int id)
      {
          var d = await _svc.GetAsync(id);
          return d is null ? NotFound() : Ok(d);
      }

      [HttpPut("{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorRequest request)
      {
          try
          {
              var d = await _svc.UpdateAsync(id, request);
              return d is null ? NotFound() : Ok(d);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpDelete("{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Delete(int id)
      {
          try
          {
              var ok = await _svc.DeleteAsync(id);
              return ok ? NoContent() : NotFound();
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }
  }
  ```

- [ ] **Step 5: Uncomment `IDoctorService` registration in `Program.cs`, build, run.**

### Task 26: Verify specialties & doctors

- [ ] **Step 1: As admin, `GET /api/specialties`.** Expected: 6 seeded specialties.
- [ ] **Step 2: As admin, `POST /api/specialties` `{ "name":"Endocrinology" }`.** Expected: 201.
- [ ] **Step 3: As admin, `PUT /api/doctors/1`** (assumes Dr. Smith got `doctor_id=1`).** Update specialty/phone. Expected: 200 with updated values.
- [ ] **Step 4: As staff (recept1), `POST /api/specialties` → 403.**

**Commit checkpoint.**

---

## Phase 6 — Patients (req #2)

### Task 27: Patient DTOs + service

**Files:**
- Create: `DTOs/Patient/CreatePatientRequest.cs`
- Create: `DTOs/Patient/UpdatePatientRequest.cs`
- Create: `DTOs/Patient/PatientResponse.cs`
- Create: `Services/IPatientService.cs`
- Create: `Services/PatientService.cs`

- [ ] **Step 1: DTOs**

  ```csharp
  // DTOs/Patient/CreatePatientRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Patient;
  public class CreatePatientRequest
  {
      [StringLength(50)] public string? mrn { get; set; }       // auto-generated if null
      [Required, StringLength(100)] public string first_name { get; set; } = string.Empty;
      [Required, StringLength(100)] public string last_name { get; set; } = string.Empty;
      [Required] public DateOnly date_of_birth { get; set; }
      [Required, RegularExpression("^(Male|Female|Other)$")] public string sex { get; set; } = string.Empty;
      [StringLength(30)] public string? phone { get; set; }
      [EmailAddress, StringLength(200)] public string? email { get; set; }
      [StringLength(500)] public string? address { get; set; }
  }
  ```

  ```csharp
  // DTOs/Patient/UpdatePatientRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Patient;
  public class UpdatePatientRequest
  {
      [Required, StringLength(50)] public string mrn { get; set; } = string.Empty;
      [Required, StringLength(100)] public string first_name { get; set; } = string.Empty;
      [Required, StringLength(100)] public string last_name { get; set; } = string.Empty;
      [Required] public DateOnly date_of_birth { get; set; }
      [Required, RegularExpression("^(Male|Female|Other)$")] public string sex { get; set; } = string.Empty;
      [StringLength(30)] public string? phone { get; set; }
      [EmailAddress, StringLength(200)] public string? email { get; set; }
      [StringLength(500)] public string? address { get; set; }
  }
  ```

  ```csharp
  // DTOs/Patient/PatientResponse.cs
  namespace ClinicManagmentAPIs.DTOs.Patient;
  public class PatientResponse
  {
      public int patient_id { get; set; }
      public string mrn { get; set; } = string.Empty;
      public string first_name { get; set; } = string.Empty;
      public string last_name { get; set; } = string.Empty;
      public DateOnly date_of_birth { get; set; }
      public string sex { get; set; } = string.Empty;
      public string? phone { get; set; }
      public string? email { get; set; }
      public string? address { get; set; }
      public DateTime created_at { get; set; }
  }
  ```

- [ ] **Step 2: `Services/IPatientService.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Common;
  using ClinicManagmentAPIs.DTOs.Patient;
  namespace ClinicManagmentAPIs.Services;
  public interface IPatientService
  {
      Task<PagedResponse<PatientResponse>> ListAsync(string? search, int page, int pageSize);
      Task<PatientResponse?> GetAsync(int id);
      Task<PatientResponse> CreateAsync(CreatePatientRequest request);
      Task<PatientResponse?> UpdateAsync(int id, UpdatePatientRequest request);
      Task<bool> DeleteAsync(int id);
  }
  ```

- [ ] **Step 3: `Services/PatientService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Common;
  using ClinicManagmentAPIs.DTOs.Patient;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class PatientService : IPatientService
  {
      private readonly DBContext _db;
      private readonly IAuditLogger _audit;
      public PatientService(DBContext db, IAuditLogger audit) { _db = db; _audit = audit; }

      public async Task<PagedResponse<PatientResponse>> ListAsync(string? search, int page, int pageSize)
      {
          page = Math.Max(page, 1);
          pageSize = Math.Clamp(pageSize, 1, 100);

          var q = _db.Patients.AsQueryable();
          if (!string.IsNullOrWhiteSpace(search))
          {
              var s = search.Trim();
              q = q.Where(p => p.first_name.Contains(s) || p.last_name.Contains(s) || p.mrn.Contains(s));
          }
          var total = await q.CountAsync();
          var items = await q.OrderByDescending(p => p.created_at)
              .Skip((page - 1) * pageSize).Take(pageSize)
              .Select(p => Map(p)).ToListAsync();
          return new PagedResponse<PatientResponse>
          {
              items = items, total = total, page = page, pageSize = pageSize
          };
      }

      public async Task<PatientResponse?> GetAsync(int id)
      {
          var p = await _db.Patients.FirstOrDefaultAsync(x => x.patient_id == id);
          return p is null ? null : Map(p);
      }

      public async Task<PatientResponse> CreateAsync(CreatePatientRequest req)
      {
          var mrn = string.IsNullOrWhiteSpace(req.mrn) ? await NextMrnAsync() : req.mrn;
          if (await _db.Patients.AnyAsync(p => p.mrn == mrn))
              throw new InvalidOperationException("MRN already exists.");

          var p = new Patient
          {
              mrn = mrn,
              first_name = req.first_name,
              last_name = req.last_name,
              date_of_birth = req.date_of_birth,
              sex = req.sex,
              phone = req.phone,
              email = req.email,
              address = req.address,
              created_at = DateTime.UtcNow
          };
          _db.Patients.Add(p);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Insert, "Patient", p.patient_id);
          return Map(p);
      }

      public async Task<PatientResponse?> UpdateAsync(int id, UpdatePatientRequest req)
      {
          var p = await _db.Patients.FirstOrDefaultAsync(x => x.patient_id == id);
          if (p is null) return null;

          if (p.mrn != req.mrn && await _db.Patients.AnyAsync(x => x.mrn == req.mrn))
              throw new InvalidOperationException("MRN already exists.");

          p.mrn = req.mrn;
          p.first_name = req.first_name;
          p.last_name = req.last_name;
          p.date_of_birth = req.date_of_birth;
          p.sex = req.sex;
          p.phone = req.phone;
          p.email = req.email;
          p.address = req.address;

          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "Patient", p.patient_id);
          return Map(p);
      }

      public async Task<bool> DeleteAsync(int id)
      {
          var p = await _db.Patients.FirstOrDefaultAsync(x => x.patient_id == id);
          if (p is null) return false;

          if (await _db.Appointments.AnyAsync(a => a.patient_id_FK == id) ||
              await _db.Invoices.AnyAsync(i => i.patient_id_FK == id) ||
              await _db.PatientHistories.AnyAsync(h => h.patient_id_FK == id))
              throw new InvalidOperationException("Patient has related records; cannot delete.");

          _db.Patients.Remove(p);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Delete, "Patient", id);
          return true;
      }

      private async Task<string> NextMrnAsync()
      {
          var year = DateTime.UtcNow.Year;
          var prefix = $"MRN-{year}-";
          var lastSeq = await _db.Patients
              .Where(p => p.mrn.StartsWith(prefix))
              .Select(p => p.mrn)
              .ToListAsync();
          var n = lastSeq
              .Select(m => int.TryParse(m[prefix.Length..], out var v) ? v : 0)
              .DefaultIfEmpty(0).Max() + 1;
          return $"{prefix}{n:D5}";
      }

      private static PatientResponse Map(Patient p) => new()
      {
          patient_id = p.patient_id,
          mrn = p.mrn,
          first_name = p.first_name,
          last_name = p.last_name,
          date_of_birth = p.date_of_birth,
          sex = p.sex,
          phone = p.phone,
          email = p.email,
          address = p.address,
          created_at = p.created_at
      };
  }
  ```

### Task 28: Rewrite `PatientsController` with role gates

**Files:** Replace `Controllers/PatientController.cs` (note: rename file/class to plural for consistency).

- [ ] **Step 1: Delete the old file**

  ```bash
  rm Controllers/PatientController.cs
  ```

- [ ] **Step 2: Create `Controllers/PatientsController.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Patient;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/patients")]
  [ApiController]
  [Authorize] // any authenticated user
  public class PatientsController : ControllerBase
  {
      private readonly IPatientService _svc;
      public PatientsController(IPatientService svc) => _svc = svc;

      [HttpGet]
      public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) =>
          Ok(await _svc.ListAsync(search, page, pageSize));

      [HttpGet("{id:int}")]
      public async Task<IActionResult> Get(int id)
      {
          var p = await _svc.GetAsync(id);
          return p is null ? NotFound(new { message = "Patient not found." }) : Ok(p);
      }

      [HttpPost]
      [Authorize(Roles = "Staff,Admin")]
      public async Task<IActionResult> Create([FromBody] CreatePatientRequest request)
      {
          try
          {
              var created = await _svc.CreateAsync(request);
              return CreatedAtAction(nameof(Get), new { id = created.patient_id }, created);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpPut("{id:int}")]
      [Authorize(Roles = "Staff,Admin")]
      public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientRequest request)
      {
          try
          {
              var updated = await _svc.UpdateAsync(id, request);
              return updated is null ? NotFound() : Ok(updated);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpDelete("{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Delete(int id)
      {
          try
          {
              var ok = await _svc.DeleteAsync(id);
              return ok ? NoContent() : NotFound();
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }
  }
  ```

- [ ] **Step 3: Uncomment `IPatientService` registration in `Program.cs`, build, run.**

### Task 29: Verify Patient CRUD per role

- [ ] **Step 1: Log in as staff (recept1). `POST /api/patients` with a valid body → 201.**
- [ ] **Step 2: `GET /api/patients` (staff) → 200, list has the patient.**
- [ ] **Step 3: `PUT /api/patients/{id}` (staff) → 200.**
- [ ] **Step 4: `DELETE /api/patients/{id}` (staff) → 403 Forbidden.** ← key check for req #2.
- [ ] **Step 5: Log in as admin. `DELETE /api/patients/{id}` → 204 (or 409 if records exist).**

**Maps to spec acceptance criteria #2.**

**Commit checkpoint.**

---

## Phase 7 — Appointments (req #4)

### Task 30: Appointment DTOs

**Files:**
- Create: `DTOs/Appointment/CreateAppointmentRequest.cs`
- Create: `DTOs/Appointment/UpdateAppointmentRequest.cs`
- Create: `DTOs/Appointment/AppointmentResponse.cs`

- [ ] **Step 1: `CreateAppointmentRequest.cs`**

  ```csharp
  using System.ComponentModel.DataAnnotations;
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.Appointment;
  public class CreateAppointmentRequest
  {
      [Required] public int patient_id { get; set; }
      [Required] public int doctor_id { get; set; }
      [Required] public DateTime scheduled_at { get; set; }
      [Required] public AppointmentType appointment_type { get; set; }
      [StringLength(500)] public string? reason { get; set; }
  }
  ```

- [ ] **Step 2: `UpdateAppointmentRequest.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.Appointment;
  public class UpdateAppointmentRequest
  {
      // Any non-null field is treated as a change.
      public int? doctor_id { get; set; }
      public DateTime? scheduled_at { get; set; }
      public AppointmentType? appointment_type { get; set; }
      public AppointmentStatus? status { get; set; }
      public string? reason { get; set; }
  }
  ```

- [ ] **Step 3: `AppointmentResponse.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.Appointment;
  public class AppointmentResponse
  {
      public int appointment_id { get; set; }
      public int patient_id { get; set; }
      public string patient_name { get; set; } = string.Empty;
      public int doctor_id { get; set; }
      public string doctor_name { get; set; } = string.Empty;
      public DateTime scheduled_at { get; set; }
      public AppointmentType appointment_type { get; set; }
      public AppointmentStatus status { get; set; }
      public string? reason { get; set; }
      public DateTime created_at { get; set; }
  }
  ```

### Task 31: `IAppointmentService` + `AppointmentService`

**Files:**
- Create: `Services/IAppointmentService.cs`
- Create: `Services/AppointmentService.cs`

- [ ] **Step 1: `Services/IAppointmentService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.DTOs.Appointment;
  using ClinicManagmentAPIs.DTOs.Common;

  namespace ClinicManagmentAPIs.Services;

  public interface IAppointmentService
  {
      Task<PagedResponse<AppointmentResponse>> ListAsync(int? doctorId, int? patientId, DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize);
      Task<PagedResponse<AppointmentResponse>> ListMineAsync(DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize);
      Task<AppointmentResponse?> GetAsync(int id);
      Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request);
      Task<AppointmentResponse?> UpdateAsync(int id, UpdateAppointmentRequest request);
      Task<bool> DeleteAsync(int id);
  }
  ```

- [ ] **Step 2: `Services/AppointmentService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Appointment;
  using ClinicManagmentAPIs.DTOs.Common;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class AppointmentService : IAppointmentService
  {
      private readonly DBContext _db;
      private readonly ICurrentUser _user;
      private readonly IAuditLogger _audit;

      public AppointmentService(DBContext db, ICurrentUser user, IAuditLogger audit)
      {
          _db = db;
          _user = user;
          _audit = audit;
      }

      public Task<PagedResponse<AppointmentResponse>> ListAsync(int? doctorId, int? patientId, DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize) =>
          QueryAsync(doctorId, patientId, from, to, status, page, pageSize);

      public Task<PagedResponse<AppointmentResponse>> ListMineAsync(DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize)
      {
          if (_user.DoctorId is not int docId)
              throw new InvalidOperationException("Caller is not a doctor.");

          // Default: today and future when no range supplied
          from ??= DateTime.UtcNow.Date;
          return QueryAsync(docId, null, from, to, status, page, pageSize);
      }

      private async Task<PagedResponse<AppointmentResponse>> QueryAsync(int? doctorId, int? patientId, DateTime? from, DateTime? to, AppointmentStatus? status, int page, int pageSize)
      {
          page = Math.Max(page, 1);
          pageSize = Math.Clamp(pageSize, 1, 100);

          var q = _db.Appointments
              .Include(a => a.Patient)
              .Include(a => a.Doctor)
              .AsQueryable();

          if (doctorId is int d) q = q.Where(a => a.doctor_id_FK == d);
          if (patientId is int p) q = q.Where(a => a.patient_id_FK == p);
          if (from is DateTime f) q = q.Where(a => a.scheduled_at >= f);
          if (to is DateTime t) q = q.Where(a => a.scheduled_at <= t);
          if (status is AppointmentStatus s) q = q.Where(a => a.status == s);

          var total = await q.CountAsync();
          var items = await q.OrderBy(a => a.scheduled_at)
              .Skip((page - 1) * pageSize).Take(pageSize)
              .Select(a => Map(a))
              .ToListAsync();

          return new PagedResponse<AppointmentResponse>
          {
              items = items, total = total, page = page, pageSize = pageSize
          };
      }

      public async Task<AppointmentResponse?> GetAsync(int id)
      {
          var a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor)
              .FirstOrDefaultAsync(x => x.appointment_id == id);
          if (a is null) return null;
          // Doctor can only see own
          if (_user.IsDoctor && a.doctor_id_FK != _user.DoctorId) return null;
          return Map(a);
      }

      public async Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest req)
      {
          if (!await _db.Patients.AnyAsync(p => p.patient_id == req.patient_id))
              throw new InvalidOperationException("Patient not found.");
          if (!await _db.Doctors.AnyAsync(d => d.doctor_id == req.doctor_id))
              throw new InvalidOperationException("Doctor not found.");
          if (await _db.Appointments.AnyAsync(x => x.doctor_id_FK == req.doctor_id && x.scheduled_at == req.scheduled_at))
              throw new InvalidOperationException("Doctor already has an appointment at that time.");

          var a = new Appointment
          {
              patient_id_FK = req.patient_id,
              doctor_id_FK = req.doctor_id,
              scheduled_at = req.scheduled_at,
              appointment_type = req.appointment_type,
              status = AppointmentStatus.Scheduled,
              reason = req.reason,
              created_by_user_id_FK = _user.UserId,
              created_at = DateTime.UtcNow
          };
          _db.Appointments.Add(a);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Insert, "Appointment", a.appointment_id);

          a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor).FirstAsync(x => x.appointment_id == a.appointment_id);
          return Map(a);
      }

      public async Task<AppointmentResponse?> UpdateAsync(int id, UpdateAppointmentRequest req)
      {
          var a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor).FirstOrDefaultAsync(x => x.appointment_id == id);
          if (a is null) return null;

          if (_user.IsDoctor)
          {
              if (a.doctor_id_FK != _user.DoctorId)
                  throw new UnauthorizedAccessException("Not your appointment.");
              // Doctors may ONLY change status
              if (req.doctor_id is not null || req.scheduled_at is not null || req.appointment_type is not null || req.reason is not null)
                  throw new UnauthorizedAccessException("Doctors can only update status.");
              if (req.status is AppointmentStatus s) a.status = s;
          }
          else // Staff or Admin
          {
              if (req.doctor_id is int newDoc)
              {
                  if (!await _db.Doctors.AnyAsync(d => d.doctor_id == newDoc))
                      throw new InvalidOperationException("Doctor not found.");
                  a.doctor_id_FK = newDoc;
              }
              if (req.scheduled_at is DateTime newWhen) a.scheduled_at = newWhen;
              if (req.appointment_type is AppointmentType t) a.appointment_type = t;
              if (req.status is AppointmentStatus s) a.status = s;
              if (req.reason is not null) a.reason = req.reason;
          }

          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "Appointment", a.appointment_id);

          a = await _db.Appointments.Include(x => x.Patient).Include(x => x.Doctor).FirstAsync(x => x.appointment_id == id);
          return Map(a);
      }

      public async Task<bool> DeleteAsync(int id)
      {
          var a = await _db.Appointments.FirstOrDefaultAsync(x => x.appointment_id == id);
          if (a is null) return false;
          if (await _db.PatientHistories.AnyAsync(h => h.appointment_id_FK == id) ||
              await _db.Vitals.AnyAsync(v => v.appointment_id_FK == id) ||
              await _db.Invoices.AnyAsync(i => i.appointment_id_FK == id))
              throw new InvalidOperationException("Appointment has dependent records; cannot delete.");
          _db.Appointments.Remove(a);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Delete, "Appointment", id);
          return true;
      }

      private static AppointmentResponse Map(Appointment a) => new()
      {
          appointment_id = a.appointment_id,
          patient_id = a.patient_id_FK,
          patient_name = a.Patient is null ? string.Empty : $"{a.Patient.first_name} {a.Patient.last_name}",
          doctor_id = a.doctor_id_FK,
          doctor_name = a.Doctor is null ? string.Empty : $"{a.Doctor.first_name} {a.Doctor.last_name}",
          scheduled_at = a.scheduled_at,
          appointment_type = a.appointment_type,
          status = a.status,
          reason = a.reason,
          created_at = a.created_at
      };
  }
  ```

### Task 32: `AppointmentsController`

**Files:** Create `Controllers/AppointmentsController.cs`.

- [ ] **Step 1: Write the controller**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.DTOs.Appointment;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/appointments")]
  [ApiController]
  [Authorize]
  public class AppointmentsController : ControllerBase
  {
      private readonly IAppointmentService _svc;
      public AppointmentsController(IAppointmentService svc) => _svc = svc;

      // Staff + Admin: all appointments (filterable)
      [HttpGet]
      [Authorize(Roles = "Staff,Admin")]
      public async Task<IActionResult> List(
          [FromQuery] int? doctorId,
          [FromQuery] int? patientId,
          [FromQuery] DateTime? from,
          [FromQuery] DateTime? to,
          [FromQuery] AppointmentStatus? status,
          [FromQuery] int page = 1,
          [FromQuery] int pageSize = 20) =>
          Ok(await _svc.ListAsync(doctorId, patientId, from, to, status, page, pageSize));

      // Doctor: appointments where doctor_id == claim
      [HttpGet("mine")]
      [Authorize(Roles = "Doctor")]
      public async Task<IActionResult> ListMine(
          [FromQuery] DateTime? from,
          [FromQuery] DateTime? to,
          [FromQuery] AppointmentStatus? status,
          [FromQuery] int page = 1,
          [FromQuery] int pageSize = 20)
      {
          try { return Ok(await _svc.ListMineAsync(from, to, status, page, pageSize)); }
          catch (InvalidOperationException ex) { return Forbid(); }
      }

      [HttpGet("{id:int}")]
      public async Task<IActionResult> Get(int id)
      {
          var a = await _svc.GetAsync(id);
          return a is null ? NotFound() : Ok(a);
      }

      [HttpPost]
      [Authorize(Roles = "Staff,Admin")]
      public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request)
      {
          try
          {
              var created = await _svc.CreateAsync(request);
              return CreatedAtAction(nameof(Get), new { id = created.appointment_id }, created);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpPut("{id:int}")]
      public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentRequest request)
      {
          try
          {
              var a = await _svc.UpdateAsync(id, request);
              return a is null ? NotFound() : Ok(a);
          }
          catch (UnauthorizedAccessException) { return Forbid(); }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpDelete("{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Delete(int id)
      {
          try
          {
              var ok = await _svc.DeleteAsync(id);
              return ok ? NoContent() : NotFound();
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }
  }
  ```

- [ ] **Step 2: Uncomment `IAppointmentService` registration in `Program.cs`, build, run.**

### Task 33: Verify "appointment created → doctor sees it"

- [ ] **Step 1: As staff, `POST /api/appointments`**

  ```json
  {
    "patient_id": <existing>,
    "doctor_id": 1,
    "scheduled_at": "2026-05-20T10:00:00Z",
    "appointment_type": "New",
    "reason": "Initial consult"
  }
  ```
  Expected: `201` with the appointment id.

- [ ] **Step 2: Log in as `drsmith` (the doctor with `doctor_id=1`).** Capture token.

- [ ] **Step 3: `GET /api/appointments/mine`** → expected: paged response containing that appointment.

- [ ] **Step 4: Create a second doctor user `drother` with `doctor_id=2`, log in, `GET /api/appointments/mine`** → expected: empty list.

- [ ] **Step 5: As staff, `GET /api/appointments/mine`** → expected: `403 Forbidden`.

**Maps to spec acceptance criteria #4.**

**Commit checkpoint.**

---

## Phase 8 — Patient History (req #5)

### Task 34: History DTOs

**Files:**
- Create: `DTOs/PatientHistory/CreatePatientHistoryRequest.cs`
- Create: `DTOs/PatientHistory/UpdatePatientHistoryRequest.cs`
- Create: `DTOs/PatientHistory/PatientHistoryResponse.cs`

- [ ] **Step 1: DTOs**

  ```csharp
  // CreatePatientHistoryRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.PatientHistory;
  public class CreatePatientHistoryRequest
  {
      [Required] public int appointment_id { get; set; }
      [Required, StringLength(1000)] public string diagnosis { get; set; } = string.Empty;
      [StringLength(4000)] public string? notes { get; set; }
      [StringLength(2000)] public string? prescription { get; set; }
  }
  ```

  ```csharp
  // UpdatePatientHistoryRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.PatientHistory;
  public class UpdatePatientHistoryRequest
  {
      [Required, StringLength(1000)] public string diagnosis { get; set; } = string.Empty;
      [StringLength(4000)] public string? notes { get; set; }
      [StringLength(2000)] public string? prescription { get; set; }
  }
  ```

  ```csharp
  // PatientHistoryResponse.cs
  namespace ClinicManagmentAPIs.DTOs.PatientHistory;
  public class PatientHistoryResponse
  {
      public int history_id { get; set; }
      public int patient_id { get; set; }
      public int doctor_id { get; set; }
      public string doctor_name { get; set; } = string.Empty;
      public int appointment_id { get; set; }
      public string diagnosis { get; set; } = string.Empty;
      public string? notes { get; set; }
      public string? prescription { get; set; }
      public DateTime created_at { get; set; }
      public DateTime? updated_at { get; set; }
  }
  ```

### Task 35: `IPatientHistoryService` + `PatientHistoryService`

**Files:**
- Create: `Services/IPatientHistoryService.cs`
- Create: `Services/PatientHistoryService.cs`

- [ ] **Step 1: Interface**

  ```csharp
  using ClinicManagmentAPIs.DTOs.PatientHistory;
  namespace ClinicManagmentAPIs.Services;
  public interface IPatientHistoryService
  {
      Task<IReadOnlyList<PatientHistoryResponse>> ListForPatientAsync(int patientId);
      Task<PatientHistoryResponse?> GetAsync(int id);
      Task<PatientHistoryResponse> CreateAsync(int patientId, CreatePatientHistoryRequest request);
      Task<PatientHistoryResponse?> UpdateAsync(int id, UpdatePatientHistoryRequest request);
      Task<bool> DeleteAsync(int id);
  }
  ```

- [ ] **Step 2: Implementation**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.PatientHistory;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class PatientHistoryService : IPatientHistoryService
  {
      private readonly DBContext _db;
      private readonly ICurrentUser _user;
      private readonly IAuditLogger _audit;
      public PatientHistoryService(DBContext db, ICurrentUser user, IAuditLogger audit) { _db = db; _user = user; _audit = audit; }

      public async Task<IReadOnlyList<PatientHistoryResponse>> ListForPatientAsync(int patientId) =>
          await _db.PatientHistories
              .Include(h => h.Doctor)
              .Where(h => h.patient_id_FK == patientId)
              .OrderByDescending(h => h.created_at)
              .Select(h => Map(h))
              .ToListAsync();

      public async Task<PatientHistoryResponse?> GetAsync(int id)
      {
          var h = await _db.PatientHistories.Include(x => x.Doctor).FirstOrDefaultAsync(x => x.history_id == id);
          return h is null ? null : Map(h);
      }

      public async Task<PatientHistoryResponse> CreateAsync(int patientId, CreatePatientHistoryRequest req)
      {
          var appt = await _db.Appointments.FirstOrDefaultAsync(a => a.appointment_id == req.appointment_id)
              ?? throw new InvalidOperationException("Appointment not found.");
          if (appt.patient_id_FK != patientId)
              throw new InvalidOperationException("Appointment does not belong to this patient.");
          if (_user.IsDoctor && appt.doctor_id_FK != _user.DoctorId)
              throw new UnauthorizedAccessException("You can only add history for your own appointments.");

          var h = new PatientHistory
          {
              patient_id_FK = patientId,
              doctor_id_FK = appt.doctor_id_FK,         // taken from appointment, NOT request — prevents impersonation
              appointment_id_FK = appt.appointment_id,
              diagnosis = req.diagnosis,
              notes = req.notes,
              prescription = req.prescription,
              created_at = DateTime.UtcNow
          };
          _db.PatientHistories.Add(h);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Insert, "PatientHistory", h.history_id);

          h = await _db.PatientHistories.Include(x => x.Doctor).FirstAsync(x => x.history_id == h.history_id);
          return Map(h);
      }

      public async Task<PatientHistoryResponse?> UpdateAsync(int id, UpdatePatientHistoryRequest req)
      {
          var h = await _db.PatientHistories.Include(x => x.Doctor).FirstOrDefaultAsync(x => x.history_id == id);
          if (h is null) return null;
          if (_user.IsDoctor && h.doctor_id_FK != _user.DoctorId)
              throw new UnauthorizedAccessException("Not your history entry.");

          h.diagnosis = req.diagnosis;
          h.notes = req.notes;
          h.prescription = req.prescription;
          h.updated_at = DateTime.UtcNow;
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "PatientHistory", h.history_id);
          return Map(h);
      }

      public async Task<bool> DeleteAsync(int id)
      {
          var h = await _db.PatientHistories.FirstOrDefaultAsync(x => x.history_id == id);
          if (h is null) return false;
          _db.PatientHistories.Remove(h);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Delete, "PatientHistory", id);
          return true;
      }

      private static PatientHistoryResponse Map(PatientHistory h) => new()
      {
          history_id = h.history_id,
          patient_id = h.patient_id_FK,
          doctor_id = h.doctor_id_FK,
          doctor_name = h.Doctor is null ? string.Empty : $"{h.Doctor.first_name} {h.Doctor.last_name}",
          appointment_id = h.appointment_id_FK,
          diagnosis = h.diagnosis,
          notes = h.notes,
          prescription = h.prescription,
          created_at = h.created_at,
          updated_at = h.updated_at
      };
  }
  ```

### Task 36: `PatientHistoryController`

**Files:** Create `Controllers/PatientHistoryController.cs`.

- [ ] **Step 1: Write the controller**

  ```csharp
  using ClinicManagmentAPIs.DTOs.PatientHistory;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [ApiController]
  [Authorize]
  public class PatientHistoryController : ControllerBase
  {
      private readonly IPatientHistoryService _svc;
      public PatientHistoryController(IPatientHistoryService svc) => _svc = svc;

      [HttpGet("api/patients/{patientId:int}/history")]
      public async Task<IActionResult> ListForPatient(int patientId) =>
          Ok(await _svc.ListForPatientAsync(patientId));

      [HttpGet("api/history/{id:int}")]
      public async Task<IActionResult> Get(int id)
      {
          var h = await _svc.GetAsync(id);
          return h is null ? NotFound() : Ok(h);
      }

      [HttpPost("api/patients/{patientId:int}/history")]
      [Authorize(Roles = "Doctor,Admin")]
      public async Task<IActionResult> Create(int patientId, [FromBody] CreatePatientHistoryRequest request)
      {
          try
          {
              var h = await _svc.CreateAsync(patientId, request);
              return CreatedAtAction(nameof(Get), new { id = h.history_id }, h);
          }
          catch (UnauthorizedAccessException) { return Forbid(); }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpPut("api/history/{id:int}")]
      [Authorize(Roles = "Doctor,Admin")]
      public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientHistoryRequest request)
      {
          try
          {
              var h = await _svc.UpdateAsync(id, request);
              return h is null ? NotFound() : Ok(h);
          }
          catch (UnauthorizedAccessException) { return Forbid(); }
      }

      [HttpDelete("api/history/{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Delete(int id)
      {
          var ok = await _svc.DeleteAsync(id);
          return ok ? NoContent() : NotFound();
      }
  }
  ```

- [ ] **Step 2: Uncomment `IPatientHistoryService` registration in `Program.cs`, build, run.**

### Task 37: Verify history rules

- [ ] **Step 1: As staff, `POST /api/appointments` creating an appointment assigned to `drsmith` (doctor_id=1) for some patient.** Capture appointment_id.
- [ ] **Step 2: Log in as `drsmith`. `POST /api/patients/{patientId}/history`** with that `appointment_id` → expected `201`.
- [ ] **Step 3: Log in as `drother` (doctor_id=2). Same call → expected `403`.**
- [ ] **Step 4: Log in as admin. Same call referencing `drsmith`'s appointment → expected `201`.** (Admin bypass works.)
- [ ] **Step 5: As staff, same call → expected `403`** (staff role not in `Doctor,Admin`).
- [ ] **Step 6: `GET /api/patients/{patientId}/history` as any authenticated user → expected 200 list.**
- [ ] **Step 7: `DELETE /api/history/{id}` as doctor → expected 403; as admin → expected 204.**

**Maps to spec acceptance criteria #5.**

**Commit checkpoint.**

---

## Phase 9 — Vitals

### Task 38: Vitals DTOs + service + controller

**Files:**
- Create: `DTOs/Vitals/CreateVitalsRequest.cs`
- Create: `DTOs/Vitals/UpdateVitalsRequest.cs`
- Create: `DTOs/Vitals/VitalsResponse.cs`
- Create: `Services/IVitalsService.cs`
- Create: `Services/VitalsService.cs`
- Create: `Controllers/VitalsController.cs`

- [ ] **Step 1: DTOs**

  ```csharp
  // CreateVitalsRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Vitals;
  public class CreateVitalsRequest
  {
      [StringLength(20)] public string? blood_pressure { get; set; }
      [Range(0, 400)] public int? heart_rate { get; set; }
      [Range(0, 50)] public decimal? temperature { get; set; }
      [Range(0, 500)] public decimal? weight_kg { get; set; }
      [Range(0, 300)] public decimal? height_cm { get; set; }
      [Required] public DateTime recorded_at { get; set; }
  }
  ```

  ```csharp
  // UpdateVitalsRequest.cs — same fields, all optional except recorded_at
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Vitals;
  public class UpdateVitalsRequest
  {
      [StringLength(20)] public string? blood_pressure { get; set; }
      [Range(0, 400)] public int? heart_rate { get; set; }
      [Range(0, 50)] public decimal? temperature { get; set; }
      [Range(0, 500)] public decimal? weight_kg { get; set; }
      [Range(0, 300)] public decimal? height_cm { get; set; }
      [Required] public DateTime recorded_at { get; set; }
  }
  ```

  ```csharp
  // VitalsResponse.cs
  namespace ClinicManagmentAPIs.DTOs.Vitals;
  public class VitalsResponse
  {
      public int vitals_id { get; set; }
      public int appointment_id { get; set; }
      public int patient_id { get; set; }
      public int recorded_by_user_id { get; set; }
      public string? blood_pressure { get; set; }
      public int? heart_rate { get; set; }
      public decimal? temperature { get; set; }
      public decimal? weight_kg { get; set; }
      public decimal? height_cm { get; set; }
      public DateTime recorded_at { get; set; }
  }
  ```

- [ ] **Step 2: `Services/IVitalsService.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Vitals;
  namespace ClinicManagmentAPIs.Services;
  public interface IVitalsService
  {
      Task<IReadOnlyList<VitalsResponse>> ListForAppointmentAsync(int appointmentId);
      Task<VitalsResponse> CreateAsync(int appointmentId, CreateVitalsRequest request);
      Task<VitalsResponse?> UpdateAsync(int id, UpdateVitalsRequest request);
  }
  ```

- [ ] **Step 3: `Services/VitalsService.cs`**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Vitals;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class VitalsService : IVitalsService
  {
      private readonly DBContext _db;
      private readonly ICurrentUser _user;
      private readonly IAuditLogger _audit;
      public VitalsService(DBContext db, ICurrentUser user, IAuditLogger audit) { _db = db; _user = user; _audit = audit; }

      public async Task<IReadOnlyList<VitalsResponse>> ListForAppointmentAsync(int appointmentId) =>
          await _db.Vitals.Where(v => v.appointment_id_FK == appointmentId)
              .OrderBy(v => v.recorded_at)
              .Select(v => Map(v)).ToListAsync();

      public async Task<VitalsResponse> CreateAsync(int appointmentId, CreateVitalsRequest req)
      {
          var appt = await _db.Appointments.FirstOrDefaultAsync(a => a.appointment_id == appointmentId)
              ?? throw new InvalidOperationException("Appointment not found.");
          if (_user.IsDoctor && appt.doctor_id_FK != _user.DoctorId)
              throw new UnauthorizedAccessException("Not your appointment.");

          var v = new Vitals
          {
              appointment_id_FK = appointmentId,
              patient_id_FK = appt.patient_id_FK,
              recorded_by_user_id_FK = _user.UserId,
              blood_pressure = req.blood_pressure,
              heart_rate = req.heart_rate,
              temperature = req.temperature,
              weight_kg = req.weight_kg,
              height_cm = req.height_cm,
              recorded_at = req.recorded_at
          };
          _db.Vitals.Add(v);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Insert, "Vitals", v.vitals_id);
          return Map(v);
      }

      public async Task<VitalsResponse?> UpdateAsync(int id, UpdateVitalsRequest req)
      {
          var v = await _db.Vitals.Include(x => x.Appointment).FirstOrDefaultAsync(x => x.vitals_id == id);
          if (v is null) return null;
          if (_user.IsDoctor && v.Appointment.doctor_id_FK != _user.DoctorId)
              throw new UnauthorizedAccessException("Not your appointment.");

          v.blood_pressure = req.blood_pressure;
          v.heart_rate = req.heart_rate;
          v.temperature = req.temperature;
          v.weight_kg = req.weight_kg;
          v.height_cm = req.height_cm;
          v.recorded_at = req.recorded_at;
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "Vitals", v.vitals_id);
          return Map(v);
      }

      private static VitalsResponse Map(Vitals v) => new()
      {
          vitals_id = v.vitals_id,
          appointment_id = v.appointment_id_FK,
          patient_id = v.patient_id_FK,
          recorded_by_user_id = v.recorded_by_user_id_FK,
          blood_pressure = v.blood_pressure,
          heart_rate = v.heart_rate,
          temperature = v.temperature,
          weight_kg = v.weight_kg,
          height_cm = v.height_cm,
          recorded_at = v.recorded_at
      };
  }
  ```

- [ ] **Step 4: `Controllers/VitalsController.cs`**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Vitals;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [ApiController]
  [Authorize]
  public class VitalsController : ControllerBase
  {
      private readonly IVitalsService _svc;
      public VitalsController(IVitalsService svc) => _svc = svc;

      [HttpGet("api/appointments/{appointmentId:int}/vitals")]
      public async Task<IActionResult> List(int appointmentId) =>
          Ok(await _svc.ListForAppointmentAsync(appointmentId));

      [HttpPost("api/appointments/{appointmentId:int}/vitals")]
      [Authorize(Roles = "Doctor,Staff,Admin")]
      public async Task<IActionResult> Create(int appointmentId, [FromBody] CreateVitalsRequest request)
      {
          try
          {
              var v = await _svc.CreateAsync(appointmentId, request);
              return Created($"/api/vitals/{v.vitals_id}", v);
          }
          catch (UnauthorizedAccessException) { return Forbid(); }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpPut("api/vitals/{id:int}")]
      [Authorize(Roles = "Doctor,Staff,Admin")]
      public async Task<IActionResult> Update(int id, [FromBody] UpdateVitalsRequest request)
      {
          try
          {
              var v = await _svc.UpdateAsync(id, request);
              return v is null ? NotFound() : Ok(v);
          }
          catch (UnauthorizedAccessException) { return Forbid(); }
      }
  }
  ```

- [ ] **Step 5: Uncomment `IVitalsService` registration, build, run.**

### Task 39: Verify vitals

- [ ] **Step 1: As staff, `POST /api/appointments/{id}/vitals` for any appointment → 201.**
- [ ] **Step 2: As `drother` (not assigned to that appointment), same call → 403.**

**Commit checkpoint.**

---

## Phase 10 — Billing

### Task 40: Invoice + LineItem + Payment DTOs

**Files:**
- Create: `DTOs/Invoice/CreateInvoiceRequest.cs`
- Create: `DTOs/Invoice/CreateInvoiceLineItemDto.cs`
- Create: `DTOs/Invoice/UpdateInvoiceStatusRequest.cs`
- Create: `DTOs/Invoice/InvoiceResponse.cs`
- Create: `DTOs/Invoice/InvoiceLineItemResponse.cs`
- Create: `DTOs/Payment/CreatePaymentRequest.cs`
- Create: `DTOs/Payment/PaymentResponse.cs`

- [ ] **Step 1: Invoice DTOs**

  ```csharp
  // CreateInvoiceLineItemDto.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Invoice;
  public class CreateInvoiceLineItemDto
  {
      [Required, StringLength(500)] public string description { get; set; } = string.Empty;
      [Required, Range(1, int.MaxValue)] public int quantity { get; set; }
      [Required, Range(0.01, 999999999.99)] public decimal unit_price { get; set; }
  }
  ```

  ```csharp
  // CreateInvoiceRequest.cs
  using System.ComponentModel.DataAnnotations;
  namespace ClinicManagmentAPIs.DTOs.Invoice;
  public class CreateInvoiceRequest
  {
      [Required] public int patient_id { get; set; }
      public int? appointment_id { get; set; }
      [Required, MinLength(1)]
      public List<CreateInvoiceLineItemDto> line_items { get; set; } = new();
  }
  ```

  ```csharp
  // UpdateInvoiceStatusRequest.cs
  using System.ComponentModel.DataAnnotations;
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.Invoice;
  public class UpdateInvoiceStatusRequest
  {
      [Required] public InvoiceStatus status { get; set; }
  }
  ```

  ```csharp
  // InvoiceLineItemResponse.cs
  namespace ClinicManagmentAPIs.DTOs.Invoice;
  public class InvoiceLineItemResponse
  {
      public int line_item_id { get; set; }
      public string description { get; set; } = string.Empty;
      public int quantity { get; set; }
      public decimal unit_price { get; set; }
      public decimal line_total { get; set; }
  }
  ```

  ```csharp
  // InvoiceResponse.cs
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.Invoice;
  public class InvoiceResponse
  {
      public int invoice_id { get; set; }
      public int patient_id { get; set; }
      public int? appointment_id { get; set; }
      public decimal total_amount { get; set; }
      public InvoiceStatus status { get; set; }
      public DateTime issued_at { get; set; }
      public List<InvoiceLineItemResponse> line_items { get; set; } = new();
  }
  ```

- [ ] **Step 2: Payment DTOs**

  ```csharp
  // CreatePaymentRequest.cs
  using System.ComponentModel.DataAnnotations;
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.Payment;
  public class CreatePaymentRequest
  {
      [Required, Range(0.01, 999999999.99)] public decimal amount { get; set; }
      [Required] public PaymentMethod method { get; set; }
      [Required] public DateTime paid_at { get; set; }
  }
  ```

  ```csharp
  // PaymentResponse.cs
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.Payment;
  public class PaymentResponse
  {
      public int payment_id { get; set; }
      public int invoice_id { get; set; }
      public decimal amount { get; set; }
      public PaymentMethod method { get; set; }
      public DateTime paid_at { get; set; }
      public int received_by_user_id { get; set; }
  }
  ```

### Task 41: Invoice service + controller

**Files:**
- Create: `Services/IInvoiceService.cs`
- Create: `Services/InvoiceService.cs`
- Create: `Controllers/InvoicesController.cs`

- [ ] **Step 1: Interface**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.DTOs.Common;
  using ClinicManagmentAPIs.DTOs.Invoice;
  namespace ClinicManagmentAPIs.Services;
  public interface IInvoiceService
  {
      Task<PagedResponse<InvoiceResponse>> ListAsync(int? patientId, InvoiceStatus? status, int page, int pageSize);
      Task<InvoiceResponse?> GetAsync(int id);
      Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request);
      Task<InvoiceResponse?> UpdateStatusAsync(int id, InvoiceStatus status);
      Task<bool> DeleteAsync(int id);
      Task MaybeAutoMarkPaidAsync(int invoiceId);
  }
  ```

- [ ] **Step 2: Implementation**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Common;
  using ClinicManagmentAPIs.DTOs.Invoice;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class InvoiceService : IInvoiceService
  {
      private readonly DBContext _db;
      private readonly ICurrentUser _user;
      private readonly IAuditLogger _audit;
      public InvoiceService(DBContext db, ICurrentUser user, IAuditLogger audit) { _db = db; _user = user; _audit = audit; }

      public async Task<PagedResponse<InvoiceResponse>> ListAsync(int? patientId, InvoiceStatus? status, int page, int pageSize)
      {
          page = Math.Max(page, 1);
          pageSize = Math.Clamp(pageSize, 1, 100);
          var q = _db.Invoices.Include(i => i.LineItems).AsQueryable();
          if (patientId is int p) q = q.Where(i => i.patient_id_FK == p);
          if (status is InvoiceStatus s) q = q.Where(i => i.status == s);
          var total = await q.CountAsync();
          var items = await q.OrderByDescending(i => i.issued_at)
              .Skip((page - 1) * pageSize).Take(pageSize)
              .Select(i => Map(i)).ToListAsync();
          return new PagedResponse<InvoiceResponse> { items = items, total = total, page = page, pageSize = pageSize };
      }

      public async Task<InvoiceResponse?> GetAsync(int id)
      {
          var i = await _db.Invoices.Include(x => x.LineItems).FirstOrDefaultAsync(x => x.invoice_id == id);
          return i is null ? null : Map(i);
      }

      public async Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest req)
      {
          if (!await _db.Patients.AnyAsync(p => p.patient_id == req.patient_id))
              throw new InvalidOperationException("Patient not found.");
          if (req.appointment_id is int ai && !await _db.Appointments.AnyAsync(a => a.appointment_id == ai))
              throw new InvalidOperationException("Appointment not found.");

          var invoice = new Invoice
          {
              patient_id_FK = req.patient_id,
              appointment_id_FK = req.appointment_id,
              status = InvoiceStatus.Draft,
              issued_at = DateTime.UtcNow,
              created_by_user_id_FK = _user.UserId,
              LineItems = req.line_items.Select(li => new InvoiceLineItem
              {
                  description = li.description,
                  quantity = li.quantity,
                  unit_price = li.unit_price,
                  line_total = li.unit_price * li.quantity
              }).ToList()
          };
          invoice.total_amount = invoice.LineItems.Sum(li => li.line_total);

          _db.Invoices.Add(invoice);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Insert, "Invoice", invoice.invoice_id);
          return Map(invoice);
      }

      public async Task<InvoiceResponse?> UpdateStatusAsync(int id, InvoiceStatus status)
      {
          var inv = await _db.Invoices.Include(i => i.LineItems).FirstOrDefaultAsync(i => i.invoice_id == id);
          if (inv is null) return null;
          if (!IsLegalTransition(inv.status, status))
              throw new InvalidOperationException($"Illegal status transition {inv.status} -> {status}.");
          inv.status = status;
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Update, "Invoice", inv.invoice_id, $"status={status}");
          return Map(inv);
      }

      public async Task<bool> DeleteAsync(int id)
      {
          var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.invoice_id == id);
          if (inv is null) return false;
          if (await _db.Payments.AnyAsync(p => p.invoice_id_FK == id))
              throw new InvalidOperationException("Invoice has payments; cannot delete.");
          _db.Invoices.Remove(inv);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Delete, "Invoice", id);
          return true;
      }

      public async Task MaybeAutoMarkPaidAsync(int invoiceId)
      {
          var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.invoice_id == invoiceId);
          if (inv is null) return;
          var paid = await _db.Payments.Where(p => p.invoice_id_FK == invoiceId).SumAsync(p => p.amount);
          if (paid >= inv.total_amount && inv.status != InvoiceStatus.Paid)
          {
              inv.status = InvoiceStatus.Paid;
              await _db.SaveChangesAsync();
              await _audit.LogAsync(AuditAction.Update, "Invoice", inv.invoice_id, "auto_paid");
          }
      }

      private static bool IsLegalTransition(InvoiceStatus from, InvoiceStatus to) =>
          (from, to) switch
          {
              (InvoiceStatus.Draft, InvoiceStatus.Sent) => true,
              (InvoiceStatus.Sent, InvoiceStatus.Paid) => true,
              (InvoiceStatus.Sent, InvoiceStatus.Void) => true,
              (InvoiceStatus.Draft, InvoiceStatus.Void) => true,
              _ => false
          };

      private static InvoiceResponse Map(Invoice i) => new()
      {
          invoice_id = i.invoice_id,
          patient_id = i.patient_id_FK,
          appointment_id = i.appointment_id_FK,
          total_amount = i.total_amount,
          status = i.status,
          issued_at = i.issued_at,
          line_items = i.LineItems.Select(li => new InvoiceLineItemResponse
          {
              line_item_id = li.line_item_id,
              description = li.description,
              quantity = li.quantity,
              unit_price = li.unit_price,
              line_total = li.line_total
          }).ToList()
      };
  }
  ```

- [ ] **Step 3: `Controllers/InvoicesController.cs`**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.DTOs.Invoice;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/invoices")]
  [ApiController]
  [Authorize(Roles = "Staff,Admin")]
  public class InvoicesController : ControllerBase
  {
      private readonly IInvoiceService _svc;
      public InvoicesController(IInvoiceService svc) => _svc = svc;

      [HttpGet]
      public async Task<IActionResult> List([FromQuery] int? patientId, [FromQuery] InvoiceStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20) =>
          Ok(await _svc.ListAsync(patientId, status, page, pageSize));

      [HttpGet("{id:int}")]
      public async Task<IActionResult> Get(int id)
      {
          var i = await _svc.GetAsync(id);
          return i is null ? NotFound() : Ok(i);
      }

      [HttpPost]
      public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
      {
          try
          {
              var inv = await _svc.CreateAsync(request);
              return CreatedAtAction(nameof(Get), new { id = inv.invoice_id }, inv);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpPut("{id:int}/status")]
      public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInvoiceStatusRequest request)
      {
          try
          {
              var inv = await _svc.UpdateStatusAsync(id, request.status);
              return inv is null ? NotFound() : Ok(inv);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }

      [HttpDelete("{id:int}")]
      [Authorize(Roles = "Admin")]
      public async Task<IActionResult> Delete(int id)
      {
          try
          {
              var ok = await _svc.DeleteAsync(id);
              return ok ? NoContent() : NotFound();
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }
  }
  ```

### Task 42: Payment service + controller

**Files:**
- Create: `Services/IPaymentService.cs`
- Create: `Services/PaymentService.cs`
- Create: `Controllers/PaymentsController.cs`

- [ ] **Step 1: Interface**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Payment;
  namespace ClinicManagmentAPIs.Services;
  public interface IPaymentService
  {
      Task<IReadOnlyList<PaymentResponse>> ListForInvoiceAsync(int invoiceId);
      Task<PaymentResponse> CreateAsync(int invoiceId, CreatePaymentRequest request);
  }
  ```

- [ ] **Step 2: Implementation**

  ```csharp
  using ClinicManagmentAPIs.Auth;
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.Payment;
  using ClinicManagmentAPIs.Model;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Services;

  public class PaymentService : IPaymentService
  {
      private readonly DBContext _db;
      private readonly ICurrentUser _user;
      private readonly IAuditLogger _audit;
      private readonly IInvoiceService _invoices;
      public PaymentService(DBContext db, ICurrentUser user, IAuditLogger audit, IInvoiceService invoices)
      { _db = db; _user = user; _audit = audit; _invoices = invoices; }

      public async Task<IReadOnlyList<PaymentResponse>> ListForInvoiceAsync(int invoiceId) =>
          await _db.Payments.Where(p => p.invoice_id_FK == invoiceId)
              .OrderBy(p => p.paid_at)
              .Select(p => Map(p)).ToListAsync();

      public async Task<PaymentResponse> CreateAsync(int invoiceId, CreatePaymentRequest req)
      {
          var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.invoice_id == invoiceId)
              ?? throw new InvalidOperationException("Invoice not found.");
          if (inv.status == InvoiceStatus.Void)
              throw new InvalidOperationException("Cannot pay a void invoice.");

          var p = new Payment
          {
              invoice_id_FK = invoiceId,
              amount = req.amount,
              method = req.method,
              paid_at = req.paid_at,
              received_by_user_id_FK = _user.UserId
          };
          _db.Payments.Add(p);
          await _db.SaveChangesAsync();
          await _audit.LogAsync(AuditAction.Insert, "Payment", p.payment_id);

          await _invoices.MaybeAutoMarkPaidAsync(invoiceId);

          return Map(p);
      }

      private static PaymentResponse Map(Payment p) => new()
      {
          payment_id = p.payment_id,
          invoice_id = p.invoice_id_FK,
          amount = p.amount,
          method = p.method,
          paid_at = p.paid_at,
          received_by_user_id = p.received_by_user_id_FK
      };
  }
  ```

- [ ] **Step 3: Controller**

  ```csharp
  using ClinicManagmentAPIs.DTOs.Payment;
  using ClinicManagmentAPIs.Services;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace ClinicManagmentAPIs.Controllers;

  [ApiController]
  [Authorize(Roles = "Staff,Admin")]
  public class PaymentsController : ControllerBase
  {
      private readonly IPaymentService _svc;
      public PaymentsController(IPaymentService svc) => _svc = svc;

      [HttpGet("api/invoices/{invoiceId:int}/payments")]
      public async Task<IActionResult> List(int invoiceId) => Ok(await _svc.ListForInvoiceAsync(invoiceId));

      [HttpPost("api/invoices/{invoiceId:int}/payments")]
      public async Task<IActionResult> Create(int invoiceId, [FromBody] CreatePaymentRequest request)
      {
          try
          {
              var p = await _svc.CreateAsync(invoiceId, request);
              return Created($"/api/payments/{p.payment_id}", p);
          }
          catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
      }
  }
  ```

- [ ] **Step 4: Uncomment `IInvoiceService` and `IPaymentService` registrations, build, run.**

### Task 43: Verify billing

- [ ] **Step 1: As staff, create an invoice for an existing patient with one line `{description: "Consultation", quantity: 1, unit_price: 200.00}`.** Expected: 201 with `total_amount=200.00`, `status=Draft`.
- [ ] **Step 2: PUT status → Sent.** Expected: 200.
- [ ] **Step 3: Post a payment of 200.00 (Cash).** Expected: 201, and the invoice's status auto-flips to `Paid`. Verify by `GET /api/invoices/{id}`.

**Commit checkpoint.**

---

## Phase 11 — Audit logs

### Task 44: `AuditLogsController`

**Files:**
- Create: `DTOs/AuditLog/AuditLogResponse.cs`
- Create: `Controllers/AuditLogsController.cs`

- [ ] **Step 1: DTO**

  ```csharp
  using ClinicManagmentAPIs.Common;
  namespace ClinicManagmentAPIs.DTOs.AuditLog;
  public class AuditLogResponse
  {
      public int audit_id { get; set; }
      public int? user_id { get; set; }
      public AuditAction action { get; set; }
      public string? entity_name { get; set; }
      public int? entity_id { get; set; }
      public string? details { get; set; }
      public DateTime created_at { get; set; }
  }
  ```

- [ ] **Step 2: Controller**

  ```csharp
  using ClinicManagmentAPIs.Common;
  using ClinicManagmentAPIs.Data;
  using ClinicManagmentAPIs.DTOs.AuditLog;
  using ClinicManagmentAPIs.DTOs.Common;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;
  using Microsoft.EntityFrameworkCore;

  namespace ClinicManagmentAPIs.Controllers;

  [Route("api/audit-logs")]
  [ApiController]
  [Authorize(Roles = "Admin")]
  public class AuditLogsController : ControllerBase
  {
      private readonly DBContext _db;
      public AuditLogsController(DBContext db) => _db = db;

      [HttpGet]
      public async Task<IActionResult> List(
          [FromQuery] int? userId,
          [FromQuery] AuditAction? action,
          [FromQuery] string? entityName,
          [FromQuery] DateTime? from,
          [FromQuery] DateTime? to,
          [FromQuery] int page = 1,
          [FromQuery] int pageSize = 50)
      {
          page = Math.Max(page, 1);
          pageSize = Math.Clamp(pageSize, 1, 200);

          var q = _db.AuditLogs.AsQueryable();
          if (userId is int u) q = q.Where(a => a.user_id_FK == u);
          if (action is AuditAction ac) q = q.Where(a => a.action == ac);
          if (!string.IsNullOrEmpty(entityName)) q = q.Where(a => a.entity_name == entityName);
          if (from is DateTime f) q = q.Where(a => a.created_at >= f);
          if (to is DateTime t) q = q.Where(a => a.created_at <= t);

          var total = await q.CountAsync();
          var items = await q.OrderByDescending(a => a.audit_id)
              .Skip((page - 1) * pageSize).Take(pageSize)
              .Select(a => new AuditLogResponse
              {
                  audit_id = a.audit_id,
                  user_id = a.user_id_FK,
                  action = a.action,
                  entity_name = a.entity_name,
                  entity_id = a.entity_id,
                  details = a.details,
                  created_at = a.created_at
              }).ToListAsync();

          return Ok(new PagedResponse<AuditLogResponse> { items = items, total = total, page = page, pageSize = pageSize });
      }
  }
  ```

- [ ] **Step 3: Build, run, verify**

  As admin: `GET /api/audit-logs?action=Login` → returns login audit rows. As staff: same call → 403.

**Commit checkpoint.**

---

## Phase 12 — Cleanup

### Task 45: Remove WeatherForecast scaffolding

**Files:**
- Delete: `Controllers/WeatherForecastController.cs`
- Delete: `WeatherForecast.cs`

- [ ] **Step 1: Remove files**

  ```bash
  rm Controllers/WeatherForecastController.cs WeatherForecast.cs
  ```

- [ ] **Step 2: Build**

  Expected: 0 errors.

### Task 46: README update

**Files:** Modify `ClinicManagmentAPIs/README.md`.

- [ ] **Step 1: Add a "Getting started" section at the top of the README documenting:**
  - Prerequisites (.NET 10 SDK, SQL Server).
  - `dotnet ef database update` to create tables.
  - Default admin credentials: `admin / Admin@123` (note "change immediately in any non-dev environment").
  - How to use the Swagger UI Authorize button.

  Keep the existing content below the new section.

### Task 47: Final end-to-end verification (mapped to spec §9)

**Files:** none (manual scenario walk-through).

- [ ] **Step 1: Drop and re-create the DB to confirm migrations + seed are reproducible**

  ```bash
  dotnet ef database drop --force
  dotnet ef database update
  ```

- [ ] **Step 2: Run the app and walk through every acceptance criterion in §9 of the spec.** Each must succeed; mark them off in the spec.

- [ ] **Step 3: Final commit**

  Suggested message: `Complete clinic backend MVP: auth, RBAC, appointments, history, vitals, billing, audit.`

---

## Self-review notes

Mapping spec sections to tasks (verified):

| Spec section | Implementing tasks |
|---|---|
| §3 Project layout | Tasks 4, 5, 16, all per-feature tasks |
| §4 Data model entities | Tasks 6–14 |
| §4.2 Relationships, indexes, FK behavior | Task 15 |
| §4.3 Seed data | Task 16 |
| §5.1 JWT config | Tasks 2, 4, 5 |
| §5.2 ICurrentUser | Task 4 |
| §5.3 Program.cs wiring | Task 5 |
| §5.4 Authorization matrix | Per-feature controller tasks (22, 24, 25, 28, 32, 36, 38, 41, 42, 44) |
| §6.1 Auth/login | Task 18 |
| §6.2 Users | Tasks 21, 22 |
| §6.3 Specialties | Task 24 |
| §6.4 Doctors | Task 25 |
| §6.5 Patients | Tasks 27, 28 |
| §6.6 Appointments | Tasks 30–32 |
| §6.7 Patient History | Tasks 34–36 |
| §6.8 Vitals | Task 38 |
| §6.9 Invoices & Payments | Tasks 40–42 |
| §6.10 Audit Logs | Task 44 |
| §7 Cross-cutting (audit, JSON enums, error shape, pagination, Swagger) | Tasks 5, 17, 20, scattered controllers |
| §9 Acceptance criteria | Verification tasks 19, 23, 26, 29, 33, 37, 39, 43, 47 |

All five user requirements covered:
- **Req 1 (login):** Task 18 + verify Task 19.
- **Req 2 (staff patient CRUD without delete):** Tasks 27, 28 + verify Task 29.
- **Req 3 (admin adds users):** Tasks 21, 22 + verify Task 23.
- **Req 4 (appointments + "mine"):** Tasks 30–32 + verify Task 33.
- **Req 5 (doctor & admin manage history + diagnosis):** Tasks 34–36 + verify Task 37.
