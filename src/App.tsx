
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

// Dashboards
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AuditLogs } from './pages/admin/AuditLogs';

import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientList } from './pages/doctor/PatientList';
import { Vitals } from './pages/doctor/Vitals';
import { AppointmentList } from './pages/doctor/AppointmentList';
import { PrescriptionList } from './pages/doctor/PrescriptionList';

import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffPatientList } from './pages/staff/PatientList';
import { PatientRegistration } from './pages/staff/PatientRegistration';
import { BillingList } from './pages/staff/BillingList';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="logs" element={<AuditLogs />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['DOCTOR']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="vitals" element={<Vitals />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="prescriptions" element={<PrescriptionList />} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['STAFF']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StaffDashboard />} />
        <Route path="patients" element={<StaffPatientList />} />
        <Route path="registration" element={<PatientRegistration />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="billing" element={<BillingList />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
