
import { User, Patient, Appointment, MedicalRecord, Billing, AuditLog, Prescription, Vitals } from '../types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Sarah Wilson', email: 'doctor@hospital.com', role: 'DOCTOR', specialty: 'Cardiology', avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=0D8ABC&color=fff' },
  { id: '2', name: 'John Staff', email: 'staff@hospital.com', role: 'STAFF', department: 'Administration', avatar: 'https://ui-avatars.com/api/?name=John+Staff&background=random' },
  { id: '3', name: 'Admin User', email: 'admin@hospital.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=333&color=fff' },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', dateOfBirth: '1985-05-12', gender: 'Female', address: '123 Maple St', bloodGroup: 'A+', status: 'Inpatient', assignedDoctorId: '1', lastVisit: '2024-03-10', allergies: 'Penicillin', chronicDiseases: 'Hypertension' },
  { id: 'p2', name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', dateOfBirth: '1990-11-23', gender: 'Male', address: '456 Oak Ave', bloodGroup: 'O-', status: 'Outpatient', assignedDoctorId: '1', lastVisit: '2024-03-12', chronicDiseases: 'Diabetes Type 2' },
  { id: 'p3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0103', dateOfBirth: '1978-08-05', gender: 'Male', address: '789 Pine Rd', bloodGroup: 'B+', status: 'Inpatient', assignedDoctorId: '1', lastVisit: '2024-03-08', allergies: 'Peanuts, Latex' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', doctorId: '1', date: '2024-05-20', time: '09:00', status: 'Scheduled', reason: 'Routine Checkup' },
  { id: 'a2', patientId: 'p2', doctorId: '1', date: '2024-05-20', time: '10:30', status: 'Scheduled', reason: 'Follow-up' },
  { id: 'a3', patientId: 'p3', doctorId: '1', date: '2024-05-21', time: '14:00', status: 'Pending', reason: 'Consultation' },
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 'mr1', patientId: 'p1', doctorId: '1', date: '2024-03-10', diagnosis: 'Hypertension', treatment: 'Lifestyle changes and medication', notes: 'Patient showing improvement.' },
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  { 
    id: 'pr1', 
    recordId: 'mr1', 
    patientId: 'p1', 
    doctorId: '1', 
    date: '2024-03-10', 
    status: 'Active',
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }
    ]
  }
];

export const MOCK_BILLING: Billing[] = [
  { 
    id: 'b1', 
    patientId: 'p1', 
    date: '2024-03-10', 
    amount: 50.00, 
    status: 'Paid', 
    items: [
      { description: 'Consultation Fee', cost: 50.00 }
    ] 
  },
  { 
    id: 'b2', 
    patientId: 'p2', 
    date: '2024-03-12', 
    amount: 75.00, 
    status: 'Unpaid', 
    items: [
      { description: 'Consultation Fee', cost: 75.00 }
    ] 
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'l1', userId: '3', action: 'User Created', timestamp: '2024-05-15 10:00:00', details: 'Added new doctor Dr. Sarah Wilson' },
  { id: 'l2', userId: '2', action: 'Patient Registered', timestamp: '2024-05-15 11:30:00', details: 'Registered patient Alice Johnson' },
];

export const MOCK_VITALS: Vitals[] = [
  {
    id: 'v1',
    patientId: 'p1',
    recordedBy: '1',
    date: '2024-03-10',
    time: '09:15',
    temperature: '37.2',
    bloodPressure: '120/82',
    heartRate: '75',
    respiratoryRate: '16',
    oxygenSaturation: '98',
    weight: '68',
    height: '165'
  }
];
