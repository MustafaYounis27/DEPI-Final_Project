# HealthCore System 🏥 | Modern Healthcare Management

HealthCore is a professional-grade Healthcare Management System (HMS) designed to digitize and optimize clinical workflows. It provides a centralized platform for medical professionals to manage patient care, clinical documentation, and administrative tasks with high efficiency and security.

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Project Idea](#-project-idea)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Default Credentials](#-default-credentials)
- [Team Members](#-team-members)
- [Project Structure](#-project-structure)

---

## 🌟 Overview
HealthCore is built to serve three primary user roles: **Doctors**, **Staff**, and **Administrators**. The system bridges the gap between patient care and hospital administration by providing real-time data access, automated billing, and secure electronic medical records (EMR).

---

## 💡 Project Idea
The core idea behind **HealthCore** is to create a "Single Source of Truth" for clinical environments. Many healthcare facilities struggle with fragmented data spread across paper files, legacy spreadsheets, and disconnected software modules. 

HealthCore solves this by:
- **Centralizing Data**: Unifying patient history, vitals, and billing into a single, accessible record.
- **Improving Efficiency**: Reducing administrative overhead through automated workflows for scheduling and invoicing.
- **Enhancing Care**: Empowering doctors with instant access to patient vitals and previous medical encounters, leading to faster and more accurate clinical decisions.
- **Ensuring Accountability**: Tracking every interaction through advanced audit logging to maintain high standards of medical compliance.

---

## ✨ Key Features

### 👨‍⚕️ Doctor Portal
- **Patient Queue**: Live view of today's appointments and consultations.
- **Vitals Monitoring**: Record and track blood pressure, heart rate, SpO2, and more.
- **EMR Management**: Create and update detailed medical records with diagnosis and treatments.
- **Digital Prescriptions**: Generate secure prescriptions linked to medical encounters.

### 👥 Staff & Operations
- **Patient Registration**: Streamlined onboarding for new patients.
- **Appointment Scheduling**: Manage hospital-wide calendars and patient check-ins.
- **Billing & Invoices**: Generate itemized bills for consultations and procedures.
- **Resource Management**: Track facility usage and patient admission status.

### 🛡️ Administration & Security
- **User Management**: Control system access for medical and administrative staff.
- **Audit Logging**: Every sensitive action is logged for compliance and accountability.
- **System Diagnostics**: Real-time monitoring of database and API health.

---

## 🏗️ System Architecture
HealthCore follows a modern **decoupled architecture**:
1. **Frontend**: A Single Page Application (SPA) built with React for a fluid user experience.
2. **Backend**: A RESTful API built with .NET 10, following Clean Architecture principles.
3. **Database**: Persistent storage using SQL Server with Entity Framework Core as the ORM.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **API Client**: [Axios](https://axios-http.com/)

### **Backend**
- **Framework**: [.NET 10 (ASP.NET Core)](https://dotnet.microsoft.com/)
- **ORM**: [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- **Database**: [SQL Server](https://www.microsoft.com/en-us/sql-server)
- **API Spec**: [Swagger / OpenAPI](https://swagger.io/)
- **Security**: [BCrypt.Net](https://github.com/BcryptNet/bcrypt.net) for secure hashing.

---

## 🏃 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (LocalDB is sufficient)

### 1. Database & Backend Setup
Navigate to the API project and initialize the database:
```bash
cd backend/HealthCore.Api
dotnet ef database update
dotnet run
```
- **API URL**: `http://localhost:5187`
- **Swagger UI**: `http://localhost:5187/swagger/index.html`

### 2. Frontend Setup
Open a new terminal in the project root:
```bash
npm install
npm run dev
```
- **Web URL**: `http://localhost:3000` (or `3002` if port 3000 is in use)

---

## 🔐 Default Credentials
Use these accounts to explore the different roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@hospital.com` | `Password123!` |
| **Doctor** | `doctor@hospital.com` | `Password123!` |
| **Staff Member** | `staff@hospital.com` | `Password123!` |

---

## 👥 Team Members
- Yahia Mohamed
- Ahmed Sameh
- Mustafa Younis
- Mai Suliman
- Muhammed Elfawy

---

## 📁 Project Structure
```text
healthcore-system/
├── backend/
│   ├── HealthCore.Api/           # API Controllers & Configuration
│   ├── HealthCore.Core/          # Domain Entities & Interfaces
│   └── HealthCore.Infrastructure/ # Data Context, Migrations & Repositories
├── src/
│   ├── components/               # Shared UI Components
│   ├── context/                  # Auth & Data Context Providers
│   ├── layouts/                  # Page Layouts (Sidebar/Topbar)
│   ├── pages/                    # Role-specific Views
│   └── types.ts                  # Global TypeScript Interfaces
└── package.json                  # Frontend Dependencies
```

---
