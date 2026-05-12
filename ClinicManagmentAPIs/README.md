# 🏥 EMR System (Electronic Medical Record)

## Getting Started

### Prerequisites

- .NET 10 SDK
- SQL Server (LocalDB, Express, Developer, or Docker SQL Server)

### One-time setup

1. **Update the connection string.** `appsettings.json` ships with a placeholder Windows server name. Override it in `appsettings.Development.json` for local dev. Example (LocalDB on Windows):
   ```json
   {
     "ConnectionStrings": {
       "ClinicalApplicationDBCon": "Server=(localdb)\\MSSQLLocalDB;Database=ClinicalApplicationDB;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```
   Or, for Docker SQL Server: `Server=localhost,1433;Database=ClinicalApplicationDB;User Id=sa;Password=<yours>;Encrypt=False;TrustServerCertificate=True;`

2. **Generate the BCrypt hash for the seeded admin user.** In a C# scratchpad or LINQPad, run:
   ```csharp
   Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Admin@123"));
   ```
   Copy the resulting `$2a$11$...` hash and paste it into `Data/DbSeeder.cs`, replacing the placeholder in the `AdminPasswordHash` constant.

3. **Apply the migration:**
   ```bash
   dotnet ef migrations add InitialCreate -o Data/Migrations
   dotnet ef database update
   ```

4. **Provide a Jwt:Key.** `appsettings.Development.json` already has a dev key (32+ chars). For production, set `Jwt:Key` via user-secrets or env vars - do not commit a real key.

### Run

```bash
dotnet run
```
Swagger UI is at `https://localhost:<port>/swagger` (port from the launchSettings.json).

### Default admin credentials

After the migration runs, log in with:
- Username: `admin`
- Password: `Admin@123` (the password you hashed in step 2 above)

**Change this immediately** in any non-development environment.

### Using Swagger to test protected endpoints

1. POST `/api/auth/login` with the admin credentials. Copy the `access_token` from the response.
2. Click the "Authorize" button in Swagger UI (lock icon, top right).
3. Paste the token (no "Bearer" prefix needed in the box; the security scheme adds it).
4. All subsequent calls now include the Authorization header.

### What's where

- `Controllers/` — thin HTTP adapters with `[Authorize]` policies.
- `Services/` — business logic and EF Core data access.
- `DTOs/` — request and response shapes (snake_case for compatibility with the JSON config).
- `Model/` — EF entities (snake_case column names).
- `Auth/` — JWT issuance, password hashing, `ICurrentUser` for claims.
- `Common/` — strongly-typed enums (employee_type, appointment_status, payment_method, etc.) stored as strings in the database.
- `Data/` — `DBContext` and `DbSeeder` (initial admin + 6 specialties).

---

---

## 📌 Project Idea

- Digital system to manage and store patient medical records  
- Replaces traditional paper-based healthcare systems  
- Improves clinic workflow efficiency  
- Reduces medical documentation errors  
- Enhances patient care quality  
- Provides secure and role-based access control  

---

## 👥 Team Members

- Ahmed Sameh – Team Leader
- Mustafa Younis
- Mai Suliman
- Muhammed Elfawy
- Yahia Mosa

---

## 🚀 Features

### 🧾 Patient Management

- Register new patients  
- Store patient personal information  
- Add patient medical history  
- Record visits and vitals  
- Add allergies and symptoms  
- Add diagnosis details  
- Create treatment plans  
- Request lab tests and radiography  
- Write prescriptions  
- Add medical notes  

### 📅 Appointment System

- Schedule new appointments  
- Manage appointment records  

### 🎟️ Queue Management

- Generate patient queue tickets  
- Print patient queue numbers  

### 💰 Financial Management

- Generate invoices  
- Print invoices  
- Track payments  
- Generate simple revenue reports  
- Monitor financial transactions  

### 👤 User Roles & Permissions

- Receptionist role with limited access  
- Doctor role with medical access  
- Accountant role with financial access  
- Admin role with full system control  
- Role-based view permissions  

---

## 🗂️ Project Plan

### 1️⃣ Research & Analysis

- Study healthcare workflow requirements  
- Define system functional requirements  
- Define user roles and permissions  
- Analyze data security standards  

### 🎯 Audience Personas

- Doctors need quick access to medical history and prescriptions  
- Receptionists manage patient registration and scheduling  
- Accountants manage invoices and financial reports  
- Admin manages users and system configuration  

### 2️⃣ Visual Identity

- Professional medical logo design  
- Blue and white healthcare color palette  
- Clean and simple interface design  

### 3️⃣ Main Designs

- System UI screens  
- Workflow diagrams  
- Project poster  

### 4️⃣ Complementary Products

- Printed invoices  
- Queue tickets  
- Prescription printouts  
- Financial reports  

### 5️⃣ Review & Finalization

- Functional testing  
- User acceptance testing  
- Bug fixing  
- Performance optimization  
- Security validation  

### 6️⃣ Final Presentation

- Live system demonstration  
- Full patient workflow presentation  
- Role-based access showcase  

---

## 📊 KPIs (Key Performance Indicators)

- System uptime greater than or equal to 99 percent  
- Average response time less than 2 seconds  
- Patient registration time less than 3 minutes  
- Appointment scheduling time less than 1 minute  
- Invoice generation time less than 30 seconds  
- User adoption rate greater than or equal to 80 percent in first month  
- Paperwork reduction greater than or equal to 70 percent  
- Zero critical security vulnerabilities at deployment  

---

## 👨‍🏫 Instructor

- Eng. Ashraf Sadek  

---
