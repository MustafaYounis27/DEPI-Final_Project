
export type Role = 'DOCTOR' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  specialty?: string; // For doctors
  department?: string;
  mustChangePassword?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  bloodGroup: string;
  status: 'Inpatient' | 'Outpatient';
  assignedDoctorId?: string;
  lastVisit?: string;
  allergies?: string;
  chronicDiseases?: string;
  insuranceId?: string;
  emergencyContact?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
  reason: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  vitals?: Vitals;
}

export interface Vitals {
  id: string;
  patientId: string;
  recordedBy: string; // Doctor or Staff ID
  date: string;
  time: string;
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight?: string;
  height?: string;
}

export interface Prescription {
  id: string;
  recordId: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'Active' | 'Dispensed' | 'Cancelled';
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
}

export interface Billing {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
  items: {
    description: string;
    cost: number;
  }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}
