# Clinic Management Backend — Design Spec

**Date:** 2026-05-12
**Project:** `ClinicManagmentAPIs` (ASP.NET Core .NET 10 Web API)
**Source-of-truth schema reference:** `ClinicManagmentAPIs/docs/ClinicApplicationDB-schema-from-backup.md`

---

## 1. Goal

Take the current skeletal Web API (which has only `Patient` and a stub `UserAccount`) and turn it into a working clinic management backend that fulfills these five user requirements:

1. Login as a **doctor**, **staff**, or **admin**.
2. As **staff**: full CRUD on patients **except delete** (delete is admin-only).
3. As **admin**: add doctor or staff member accounts.
4. As **doctor**: see all appointments assigned to me. As **staff or admin**: create an appointment (New examination or Follow-up), assign it to a doctor, schedule it — and the assigned doctor must see it under requirement (4).
5. As **doctor**: manage patient history and add a diagnosis. **Admin** can also manage patient history (any doctor's entries).

Additional scope agreed during brainstorming:
- `EmployeeType` strongly-typed enum (replaces the loose `role` string).
- Doctor `Specialty` modeled as a separate table with FK from `Doctor`.
- `Vitals` recording tied to an appointment.
- Billing: `Invoice`, `InvoiceLineItem`, `Payment` (methods: `Cash | Card | Insurance` — `EFT` dropped).
- `AuditLog` written on every authenticated write action and on login.

---

## 2. Decisions (locked during brainstorming)

| Topic | Decision |
|---|---|
| DB strategy | **Code-first EF migrations**. Ignore the `.bak`. C# entities are source of truth; schema doc is reference only. |
| Auth | **JWT bearer (HS256)** with claims `sub`, `role`, `doctor_id`. 8-hour expiry. |
| Password hashing | **BCrypt.Net-Next** (`BCrypt.HashPassword` / `BCrypt.Verify`). |
| Initial admin | Seeded by migration: `username=admin`, `password=Admin@123`. Must be changed on first login (out of scope for v1 — documented in README). |
| Project layout | **Single-project, layered**: `Controllers/ → Services/ → Data/`, plus `DTOs/`, `Auth/`, `Common/` (enums), `Model/`. No separate projects, no MediatR. |
| Employee type | C# enum `EmployeeType { Doctor, Staff, Admin }` replaces the existing `role` string column on `UserAccount`. Stored as **string** in SQL via `HasConversion<string>()` so values match the CHECK constraints in the schema doc. |
| Specialty | Separate `Specialty` table (id, name unique, description). `Doctor.specialty_id_FK` is required. Admin CRUD; everyone reads. |
| Patient history | One `PatientHistory` row per entry: `diagnosis` (required text), `notes`, `prescription`, all tied to `(patient_id, doctor_id, appointment_id)`. |
| Encounter / Visit | **Not modeled.** The schema doc has separate `Encounter` and `Visit` tables; we collapse them into `Appointment + PatientHistory + Vitals` to match the five user requirements without unused tables. |
| Cascade deletes | OFF everywhere. Delete blocked by service-layer business rules (e.g., can't delete a patient with appointments). |

---

## 3. Project layout

```
ClinicManagmentAPIs/
  Auth/
    JwtTokenService.cs          # IJwtTokenService — issues tokens
    PasswordHasher.cs           # IPasswordHasher — BCrypt wrapper
    CurrentUser.cs              # ICurrentUser — reads claims off HttpContext
  Common/
    EmployeeType.cs             # enum { Doctor, Staff, Admin }
    AppointmentStatus.cs        # enum { Scheduled, CheckedIn, Completed, Cancelled, NoShow }
    AppointmentType.cs          # enum { New, FollowUp }
    InvoiceStatus.cs            # enum { Draft, Sent, Paid, Void }
    PaymentMethod.cs            # enum { Cash, Card, Insurance }
    AuditAction.cs              # enum { Insert, Update, Delete, Login }
  Controllers/
    AuthController.cs
    UsersController.cs
    SpecialtiesController.cs
    DoctorsController.cs
    PatientsController.cs       # replaces existing PatientController
    AppointmentsController.cs
    PatientHistoryController.cs
    VitalsController.cs
    InvoicesController.cs
    PaymentsController.cs
    AuditLogsController.cs
  Services/
    IAuthService.cs / AuthService.cs
    IUserService.cs / UserService.cs
    ISpecialtyService.cs / SpecialtyService.cs
    IDoctorService.cs / DoctorService.cs
    IPatientService.cs / PatientService.cs
    IAppointmentService.cs / AppointmentService.cs
    IPatientHistoryService.cs / PatientHistoryService.cs
    IVitalsService.cs / VitalsService.cs
    IInvoiceService.cs / InvoiceService.cs
    IPaymentService.cs / PaymentService.cs
    IAuditLogger.cs / AuditLogger.cs
  DTOs/
    Auth/           # LoginRequest, LoginResponse, UserSummaryDto
    User/           # CreateUserRequest, UpdateUserActiveRequest, ResetPasswordRequest, UserResponse
    Specialty/      # CreateSpecialtyRequest, UpdateSpecialtyRequest, SpecialtyResponse
    Doctor/         # UpdateDoctorRequest, DoctorResponse
    Patient/        # CreatePatientRequest, UpdatePatientRequest, PatientResponse
    Appointment/    # CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentResponse, AppointmentFilter
    PatientHistory/ # CreatePatientHistoryRequest, UpdatePatientHistoryRequest, PatientHistoryResponse
    Vitals/         # CreateVitalsRequest, UpdateVitalsRequest, VitalsResponse
    Invoice/        # CreateInvoiceRequest, CreateInvoiceLineItemDto, UpdateInvoiceStatusRequest, InvoiceResponse
    Payment/        # CreatePaymentRequest, PaymentResponse
    AuditLog/       # AuditLogResponse, AuditLogFilter
    Common/         # PagedResponse<T>, ErrorResponse
  Model/                        # one .cs per entity (see §4)
  Data/
    DBContext.cs                # rewritten — all DbSets + OnModelCreating + enum conversions + check constraints
    DbSeeder.cs                 # initial admin user + 6 specialties
    Migrations/                 # auto-generated by `dotnet ef migrations add InitialCreate`
  Program.cs                    # add JWT, swagger bearer, DI registrations
  appsettings.json              # add Jwt section
  ClinicManagmentAPIs.csproj    # add BCrypt.Net-Next, Microsoft.AspNetCore.Authentication.JwtBearer
```

**Removed:** the old `WeatherForecast.cs` and `WeatherForecastController.cs` (scaffolding leftovers).
**Replaced:** the existing `PatientController.cs` (which has `[HttpDelete]` open to anyone) is rewritten to enforce the new role policies.
**Modified:** `UserAccount.cs` — `role` (string) → `employee_type` (`EmployeeType` enum).

---

## 4. Data model

All column names use `snake_case` to match the existing `Patient` entity convention. Enum properties are stored as strings in SQL via `HasConversion<string>()`.

### 4.1 Entities

**`Specialty`**
- `specialty_id` (PK, int identity)
- `name` (string, required, unique, max 100)
- `description` (string?, max 500)

**`Doctor`**
- `doctor_id` (PK, int identity)
- `first_name` (string, required, max 100)
- `last_name` (string, required, max 100)
- `specialty_id_FK` (int, required, FK → `Specialty.specialty_id`)
- `phone` (string?, max 30)
- `email` (string?, max 200)
- `active_flag` (bool, default true)
- `created_at` (DateTime, default UTC now)

**`UserAccount` (modified from existing)**
- `user_id` (PK, int identity)
- `username` (string, required, unique, max 50)
- `password_hash` (string, required, max 200) — BCrypt hash
- `employee_type` (`EmployeeType` enum, stored as string)
- `doctor_id_FK` (int?, FK → `Doctor.doctor_id`) — required when `employee_type = Doctor`, null otherwise
- `email` (string?, max 200)
- `active_flag` (bool, default true)
- `created_at` (DateTime, default UTC now)

**`Patient` (unchanged from existing)**
- `patient_id`, `mrn`, `first_name`, `last_name`, `date_of_birth`, `sex`, `phone?`, `email?`, `address?`, `created_at` — as currently defined.

**`Appointment`**
- `appointment_id` (PK, int identity)
- `patient_id_FK` (int, required, FK → `Patient`)
- `doctor_id_FK` (int, required, FK → `Doctor`)
- `scheduled_at` (DateTime, required)
- `appointment_type` (`AppointmentType` enum: `New | FollowUp`)
- `status` (`AppointmentStatus` enum, default `Scheduled`)
- `reason` (string?, max 500)
- `created_by_user_id_FK` (int, required, FK → `UserAccount`)
- `created_at` (DateTime, default UTC now)

**`PatientHistory`**
- `history_id` (PK, int identity)
- `patient_id_FK` (int, required, FK → `Patient`)
- `doctor_id_FK` (int, required, FK → `Doctor`)
- `appointment_id_FK` (int, required, FK → `Appointment`)
- `diagnosis` (string, required, max 1000)
- `notes` (string?, max 4000)
- `prescription` (string?, max 2000)
- `created_at` (DateTime, default UTC now)
- `updated_at` (DateTime?)

**`Vitals`**
- `vitals_id` (PK, int identity)
- `appointment_id_FK` (int, required, FK → `Appointment`)
- `patient_id_FK` (int, required, FK → `Patient`)
- `recorded_by_user_id_FK` (int, required, FK → `UserAccount`)
- `blood_pressure` (string?, max 20)  — e.g. "120/80"
- `heart_rate` (int?)
- `temperature` (decimal?, precision 4,1)  — Celsius
- `weight_kg` (decimal?, precision 5,2)
- `height_cm` (decimal?, precision 5,2)
- `recorded_at` (DateTime, default UTC now)

**`Invoice`**
- `invoice_id` (PK, int identity)
- `patient_id_FK` (int, required, FK → `Patient`)
- `appointment_id_FK` (int?, FK → `Appointment`)
- `total_amount` (decimal, precision 12,2, required) — server-computed sum of line items
- `status` (`InvoiceStatus` enum, default `Draft`)
- `issued_at` (DateTime, default UTC now)
- `created_by_user_id_FK` (int, required, FK → `UserAccount`)

**`InvoiceLineItem`**
- `line_item_id` (PK, int identity)
- `invoice_id_FK` (int, required, FK → `Invoice`)
- `description` (string, required, max 500)
- `quantity` (int, required, ≥ 1)
- `unit_price` (decimal, precision 12,2, required)
- `line_total` (decimal, precision 12,2, computed = `quantity * unit_price`)

**`Payment`**
- `payment_id` (PK, int identity)
- `invoice_id_FK` (int, required, FK → `Invoice`)
- `amount` (decimal, precision 12,2, required, > 0)
- `method` (`PaymentMethod` enum: `Cash | Card | Insurance`)
- `paid_at` (DateTime, required)
- `received_by_user_id_FK` (int, required, FK → `UserAccount`)

**`AuditLog`**
- `audit_id` (PK, int identity)
- `user_id_FK` (int?, FK → `UserAccount`) — null only for failed-login attempts where username didn't match
- `action` (`AuditAction` enum: `Insert | Update | Delete | Login`)
- `entity_name` (string?, max 100) — e.g. "Patient", "Appointment". Null for `Login`.
- `entity_id` (int?) — primary key of the affected row. Null for `Login`.
- `details` (string?, max 2000) — short text or compact JSON. Used for the username on `Login`.
- `created_at` (DateTime, default UTC now)

### 4.2 Relationships (configured in `OnModelCreating`)

- `UserAccount` ↔ `Doctor`: optional one-to-one (`UserAccount.doctor_id_FK`); restrict delete.
- `Doctor` → `Specialty`: required many-to-one; restrict delete.
- `Appointment` → `Patient`, `Doctor`, `UserAccount` (creator): all restrict.
- `PatientHistory` → `Patient`, `Doctor`, `Appointment`: all restrict.
- `Vitals` → `Appointment`, `Patient`, `UserAccount` (recorder): all restrict.
- `Invoice` → `Patient` (required), `Appointment` (optional), `UserAccount` (creator).
- `InvoiceLineItem` → `Invoice`: cascade delete (line items belong to their invoice).
- `Payment` → `Invoice`: restrict.
- `AuditLog` → `UserAccount`: optional, restrict.
- Unique index on `UserAccount.username`, `Specialty.name`, `Patient.mrn`.
- Index on `Appointment.doctor_id_FK`, `Appointment.scheduled_at` (for "appointments for me" queries).

### 4.3 Seed data (in initial migration)

**Specialties:** Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology, General Practice.

**Initial admin user:**
- `username`: `admin`
- `password_hash`: BCrypt of `Admin@123` (hash baked into the migration so it's stable)
- `employee_type`: `Admin`
- `email`: `admin@clinic.local`
- `active_flag`: `true`

Documented in `README.md` so the developer knows how to log in initially.

---

## 5. Authentication & authorization

### 5.1 JWT

Configured via `appsettings.json`:

```json
"Jwt": {
  "Key": "<replace-with-32+-char-secret-stored-in-user-secrets-in-real-life>",
  "Issuer": "ClinicManagmentAPIs",
  "Audience": "ClinicManagmentAPIs.Client",
  "ExpiryHours": 8
}
```

**Claims issued on login:**
| Claim | Value |
|---|---|
| `sub` (`ClaimTypes.NameIdentifier`) | `user_id` |
| `name` (`ClaimTypes.Name`) | `username` |
| `role` (`ClaimTypes.Role`) | `employee_type.ToString()` — `"Doctor"`, `"Staff"`, or `"Admin"` |
| `doctor_id` (custom) | `UserAccount.doctor_id_FK?.ToString()` — present only when employee is a Doctor |
| `exp` | now + 8 hours |

### 5.2 `ICurrentUser`

Reads the above claims off `HttpContext.User`. Exposes:
- `int UserId`
- `EmployeeType EmployeeType`
- `int? DoctorId`
- `bool IsAdmin`, `bool IsDoctor`, `bool IsStaff` (convenience)

Services depend on `ICurrentUser`, not `IHttpContextAccessor`, so they're easy to unit-test.

### 5.3 `Program.cs` wiring (new bits)

- Register `Microsoft.AspNetCore.Authentication.JwtBearer` with `TokenValidationParameters` (issuer, audience, key, validate lifetime).
- `app.UseAuthentication()` **before** `app.UseAuthorization()`.
- Register all services (`IAuthService`, `IPatientService`, ...) as `Scoped`.
- Register `ICurrentUser` as `Scoped` and `IHttpContextAccessor` as singleton.
- Swagger: add `AddSecurityDefinition("Bearer", ...)` so the Swagger UI gets a "Authorize" button for pasting tokens.

### 5.4 Authorization matrix

| Endpoint | Anonymous | Doctor | Staff | Admin |
|---|---|---|---|---|
| `POST /api/auth/login` | ✅ | — | — | — |
| `GET /api/users`, `GET /api/users/{id}` | ❌ | ❌ | ❌ | ✅ |
| `POST /api/users` | ❌ | ❌ | ❌ | ✅ |
| `PUT /api/users/{id}/active` | ❌ | ❌ | ❌ | ✅ |
| `PUT /api/users/{id}/password` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/specialties` | ❌ | ✅ | ✅ | ✅ |
| `POST/PUT/DELETE /api/specialties` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/doctors`, `GET /api/doctors/{id}` | ❌ | ✅ | ✅ | ✅ |
| `PUT /api/doctors/{id}` | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/doctors/{id}` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/patients`, `GET /api/patients/{id}` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/patients` | ❌ | ❌ | ✅ | ✅ |
| `PUT /api/patients/{id}` | ❌ | ❌ | ✅ | ✅ |
| `DELETE /api/patients/{id}` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/appointments` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/appointments/mine` | ❌ | ✅ | ❌ | ❌ |
| `GET /api/appointments/{id}` | ❌ | ✅ (own only) | ✅ | ✅ |
| `POST /api/appointments` | ❌ | ❌ | ✅ | ✅ |
| `PUT /api/appointments/{id}` | ❌ | ✅ (own — status only) | ✅ | ✅ |
| `DELETE /api/appointments/{id}` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/patients/{id}/history`, `GET /api/history/{id}` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/patients/{id}/history` | ❌ | ✅ (own appointments) | ❌ | ✅ (any) |
| `PUT /api/history/{id}` | ❌ | ✅ (own entries) | ❌ | ✅ |
| `DELETE /api/history/{id}` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/appointments/{id}/vitals` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/appointments/{id}/vitals` | ❌ | ✅ (own) | ✅ | ✅ |
| `PUT /api/vitals/{id}` | ❌ | ✅ (own) | ✅ | ✅ |
| `GET /api/invoices`, `GET /api/invoices/{id}` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/invoices` | ❌ | ❌ | ✅ | ✅ |
| `PUT /api/invoices/{id}/status` | ❌ | ❌ | ✅ | ✅ |
| `DELETE /api/invoices/{id}` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/invoices/{id}/payments` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/invoices/{id}/payments` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/audit-logs` | ❌ | ❌ | ❌ | ✅ |

**Enforcement strategy:**
- Coarse role gates: `[Authorize(Roles = "Admin,Staff")]` etc. at the controller method level.
- Fine-grained ownership rules (e.g. "doctor can only see own appointments"): enforced in the **service layer** by checking `ICurrentUser.DoctorId` against the row's `doctor_id_FK`. Return `404 NotFound` for cross-tenant reads (don't leak that the row exists); return `403 Forbidden` for cross-tenant writes.
- Admin bypasses ownership checks: services check `if (currentUser.IsAdmin) { skip ownership check }`.

---

## 6. Endpoint specifications

For each endpoint: HTTP method, path, auth, request shape, response shape, error cases. Where the body shape is obvious from the DTO name, only deviations are listed.

### 6.1 Auth

**`POST /api/auth/login`** — anonymous
- Request: `{ "username": "admin", "password": "Admin@123" }`
- 200: `LoginResponse = { access_token, expires_at, user: { user_id, username, employee_type, doctor_id? } }`
- 401: bad username or password (write `AuditLog` with `action=Login`, `user_id_FK=null`, `details=username`)
- On success: write `AuditLog` with `action=Login`, `user_id_FK=<that user>`, `details=null`.
- 403: account is inactive (`active_flag=false`).

### 6.2 Users (admin-only)

**`POST /api/users`** — `Admin`
- Request:
  ```json
  {
    "username": "drsmith",
    "password": "S0meStr0ng!",
    "employee_type": "Doctor",
    "email": "drsmith@clinic.local",
    "doctor": {
      "first_name": "Jane",
      "last_name": "Smith",
      "specialty_id": 1,
      "phone": "+201234567890",
      "email": "drsmith@clinic.local"
    }
  }
  ```
- When `employee_type = Doctor`: `doctor` field is **required** and the service creates `Doctor` + `UserAccount` in one DB transaction, then sets `UserAccount.doctor_id_FK`.
- When `employee_type = Staff` or `Admin`: `doctor` field must be omitted/null.
- 201: `UserResponse`. 400: validation errors (e.g. doctor data missing for `Doctor`, username already taken, specialty doesn't exist).

**`GET /api/users`, `GET /api/users/{id}`** — `Admin`. Standard list/get.

**`PUT /api/users/{id}/active`** — `Admin`. Body: `{ "active_flag": false }`. Used to disable a leaving employee without deleting their audit trail.

**`PUT /api/users/{id}/password`** — `Admin`. Body: `{ "new_password": "..." }`. Re-hashes via BCrypt.

### 6.3 Specialties

Standard CRUD. `DELETE` returns `409 Conflict` if any Doctor references that specialty.

### 6.4 Doctors

- `GET /api/doctors` — list with `?specialty_id=&active=`.
- `GET /api/doctors/{id}` — one.
- `PUT /api/doctors/{id}` — admin updates profile fields & specialty (does NOT touch the linked UserAccount username/password — those go through `/api/users`).
- `DELETE /api/doctors/{id}` — admin; `409` if doctor has any appointments. Also deactivates the linked UserAccount (sets `active_flag=false`) in the same transaction.

### 6.5 Patients

- `GET /api/patients` — paged list `?page=1&pageSize=20&search=<name_or_mrn>`.
- `GET /api/patients/{id}` — one.
- `POST /api/patients` — staff/admin. Service auto-generates `mrn` if not provided (format `MRN-{yyyy}-{seq}`).
- `PUT /api/patients/{id}` — staff/admin.
- `DELETE /api/patients/{id}` — **admin only**; `409` if patient has any appointments/invoices/history.

### 6.6 Appointments

- `GET /api/appointments` — staff/admin. Filters: `?doctorId=&patientId=&from=&to=&status=&page=&pageSize=`.
- `GET /api/appointments/mine` — **doctor only**. Filters by `doctor_id` claim. Same query params *except* `doctorId` (forced to current). Defaults to "today + future" if no `from/to`.
- `GET /api/appointments/{id}` — doctor sees own (else `404`); staff/admin see any.
- `POST /api/appointments` — staff/admin. Body: `{ patient_id, doctor_id, scheduled_at, appointment_type ("New"|"FollowUp"), reason? }`. Status auto-set to `Scheduled`. `created_by_user_id_FK` set from `ICurrentUser`.
  - 409 if the doctor already has another appointment at the exact `scheduled_at` (basic double-booking check).
- `PUT /api/appointments/{id}` — staff/admin can change `scheduled_at`, `doctor_id`, `appointment_type`, `reason`, `status`. Doctor (when targeting their own) can **only** change `status` to `CheckedIn | Completed | Cancelled | NoShow`.
- `DELETE /api/appointments/{id}` — admin only.

### 6.7 Patient History

- `GET /api/patients/{id}/history` — any authenticated; lists all history rows for that patient ordered by `created_at DESC`.
- `GET /api/history/{id}` — one entry.
- `POST /api/patients/{id}/history` — `Doctor` or `Admin`.
  - Body: `{ appointment_id, diagnosis, notes?, prescription? }`.
  - Validations: appointment must belong to that patient; for Doctor caller, the appointment's `doctor_id_FK` must equal `ICurrentUser.DoctorId` (Admin skips this check); diagnosis is required.
  - Service sets `doctor_id_FK` from the appointment (not from request body), preventing impersonation.
- `PUT /api/history/{id}` — `Doctor` (only if `doctor_id_FK == ICurrentUser.DoctorId`) or `Admin`. Updates `diagnosis`, `notes`, `prescription`, and `updated_at`.
- `DELETE /api/history/{id}` — `Admin`.

### 6.8 Vitals

- `GET /api/appointments/{id}/vitals` — any authenticated. Lists all vitals readings for that appointment.
- `POST /api/appointments/{id}/vitals` — `Staff`, `Admin`, or `Doctor` (own appointment). Service sets `patient_id_FK` from the appointment and `recorded_by_user_id_FK` from `ICurrentUser`.
- `PUT /api/vitals/{id}` — same role rules. Doctor restricted to vitals on their own appointments.

### 6.9 Invoices & Payments

- `POST /api/invoices` — staff/admin. Body includes line items; service computes `line_total` per line and `total_amount` as the sum.
- `PUT /api/invoices/{id}/status` — staff/admin. Validates legal transitions: `Draft → Sent`, `Sent → Paid | Void`, `Paid → ` (terminal), `Void → ` (terminal). Returns `409` for illegal moves.
- `POST /api/invoices/{id}/payments` — staff/admin. After insert, if sum of payments ≥ `total_amount`, the service auto-transitions the invoice to `Paid`.

### 6.10 Audit Logs

- `GET /api/audit-logs` — `Admin`. Filters: `?userId=&action=&entityName=&from=&to=&page=&pageSize=`. Always paginated; ordered by `created_at DESC`.

---

## 7. Cross-cutting concerns

### 7.1 Audit logging

`IAuditLogger` exposes a single async method:

```csharp
Task LogAsync(AuditAction action, string? entityName, int? entityId, string? details = null);
```

Every service `Create*` / `Update*` / `Delete*` method calls it as the **last** step before `SaveChangesAsync` (or in the same `SaveChangesAsync`, batched into one transaction). The audit row's `user_id_FK` comes from `ICurrentUser.UserId`. `AuthService.LoginAsync` calls it directly on success and failure (failure passes `null` for `user_id_FK` and the attempted username in `details`).

### 7.2 Validation

DTOs use data annotations (`[Required]`, `[StringLength]`, `[EmailAddress]`, `[Range]`, `[RegularExpression]`). `[ApiController]` auto-returns `400` with `ValidationProblemDetails` for binding failures.

Enums are bound from strings (`Newtonsoft`-free — built-in `JsonStringEnumConverter` configured in `Program.cs`). Invalid enum values return `400` automatically.

### 7.3 Error response shape

Custom middleware (or filter) translates known exception types to consistent JSON:

```json
{
  "status": 409,
  "message": "Cannot delete patient: 3 appointments exist.",
  "errors": []
}
```

Mapping:
- `ValidationException` / model binding failure → `400`
- Missing JWT / invalid JWT → `401`
- Role/ownership failure → `403`
- Entity not found → `404`
- Business rule violation (e.g. delete blocked, double-booking) → `409`

### 7.4 Pagination

List endpoints accept `?page=1&pageSize=20` (default 1/20, max 100). Response shape:

```json
{ "items": [...], "total": 137, "page": 1, "pageSize": 20 }
```

### 7.5 Configuration

- `appsettings.json`: `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiryHours`.
- `appsettings.Development.json`: dev-only key.
- README documents that the production key should come from environment variables or user-secrets, not committed JSON.

### 7.6 Swagger

`AddSwaggerGen` is extended with:
- `AddSecurityDefinition("Bearer", ...)` — Bearer scheme.
- `AddSecurityRequirement(...)` — applies to all endpoints (Swagger UI shows the lock icon).

Result: Swagger UI gets an "Authorize" button. Paste the token from `/api/auth/login`, then all subsequent calls send the header.

---

## 8. Non-goals (explicitly out of scope)

The following are explicitly **not** included in v1, to keep the spec focused on the user's five requirements + agreed additions:

- Refresh tokens, password-reset flow, email verification.
- Multi-tenant / multi-clinic support.
- Encounter and Visit tables from the schema doc (collapsed into Appointment + PatientHistory + Vitals).
- `InsurancePlan` / `PatientInsurance` / `PatientRegistration` tables.
- File uploads (lab results, imaging).
- Notifications / reminders.
- Front-end / UI.
- Unit + integration tests — covered separately in the implementation plan, not specified here.
- Production secrets management beyond a documented "use env vars / user-secrets" note.

---

## 9. Acceptance criteria (mapped back to requirements)

A reviewer can verify the spec is met by running through Swagger UI:

1. **Req 1 — Login as doctor/staff/admin.** `POST /api/auth/login` with each of the seeded accounts returns a JWT containing the correct `role` and (for doctors) `doctor_id` claim.
2. **Req 2 — Staff CRUD on patients without delete.** Logged in as staff, all `GET/POST/PUT /api/patients*` succeed, `DELETE /api/patients/{id}` returns `403`.
3. **Req 3 — Admin adds doctor/staff.** Logged in as admin, `POST /api/users` with `employee_type=Doctor` creates both a `Doctor` row and a `UserAccount`, links them, and the new doctor can immediately log in.
4. **Req 4 — Appointment creation and "see mine".**
   - `POST /api/appointments` as staff or admin with `appointment_type=New` or `FollowUp` succeeds.
   - The assigned doctor's `GET /api/appointments/mine` then returns that appointment.
   - A different doctor's `/mine` returns an empty list (or no overlap with the assignment).
5. **Req 5 — Doctor & admin manage history + diagnosis.** `POST /api/patients/{id}/history` as the doctor whose appointment it is succeeds; the same call from a different doctor returns `403`; admin can post history for any doctor's appointment.
