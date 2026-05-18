import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, Prescription, MedicalRecord, Appointment, Billing, Vitals } from '../types';
import { api } from '../lib/api';

interface CaseRecordsContextType {
  patients: Patient[];
  prescriptions: Prescription[];
  medicalRecords: MedicalRecord[];
  appointments: Appointment[];
  bills: Billing[];
  addPatient: (patient: Omit<Patient, 'id' | 'status'>) => Promise<void>;
  updatePatient: (id: string, updatedFields: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'date' | 'status'>) => Promise<void>;
  updatePrescription: (id: string, prescription: Partial<Prescription>) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'date'>) => Promise<void>;
  updateMedicalRecord: (id: string, record: Partial<MedicalRecord>) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addBill: (bill: Omit<Billing, 'id' | 'date'>) => Promise<void>;
  updateBill: (id: string, bill: Partial<Billing>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  vitals: Vitals[];
  users: any[];
  doctors: any[];
  addVitals: (vitals: Omit<Vitals, 'id' | 'date' | 'time'>) => Promise<void>;
  updateVitals: (id: string, vitals: Omit<Vitals, 'id' | 'date' | 'time'>) => Promise<void>;
  deleteVitals: (id: string) => Promise<void>;
}

const CaseRecordsContext = createContext<CaseRecordsContextType | undefined>(undefined);

// Helper to sanitize backend numeric fields to React string types
const sanitizeItem = (item: any) => {
  if (!item) return item;
  const mapped = { ...item };
  if ('id' in mapped && mapped.id !== null) mapped.id = mapped.id.toString();
  if ('patientId' in mapped && mapped.patientId !== null) mapped.patientId = mapped.patientId.toString();
  if ('doctorId' in mapped && mapped.doctorId !== null) mapped.doctorId = mapped.doctorId.toString();
  if ('assignedDoctorId' in mapped && mapped.assignedDoctorId !== null) mapped.assignedDoctorId = mapped.assignedDoctorId.toString();
  if ('recordId' in mapped && mapped.recordId !== null) mapped.recordId = mapped.recordId.toString();
  if ('recordedById' in mapped && mapped.recordedById !== null) mapped.recordedBy = mapped.recordedById.toString();
  
  // Format Date ISO strings into YYYY-MM-DD
  if ('date' in mapped && typeof mapped.date === 'string' && mapped.date.includes('T')) {
    mapped.date = mapped.date.split('T')[0];
  }
  if ('lastVisit' in mapped && typeof mapped.lastVisit === 'string' && mapped.lastVisit.includes('T')) {
    mapped.lastVisit = mapped.lastVisit.split('T')[0];
  }
  return mapped;
};

export const CaseRecordsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Billing[]>([]);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Role.Doctor is 1 in the backend enum
  const doctors = users.filter(u => u.role === 1 || u.role === 'Doctor');

  const fetchAllData = async () => {
    try {
      const [patientsRes, prescriptionsRes, recordsRes, appointmentsRes, billingsRes, vitalsRes, usersRes] = await Promise.all([
        api.get('/patients'),
        api.get('/prescriptions'),
        api.get('/medicalrecords'),
        api.get('/appointments'),
        api.get('/billings'),
        api.get('/vitals'),
        api.get('/users')
      ]);

      setPatients(patientsRes.data.map(sanitizeItem));
      setPrescriptions(prescriptionsRes.data.map(sanitizeItem));
      setMedicalRecords(recordsRes.data.map(sanitizeItem));
      setAppointments(appointmentsRes.data.map(sanitizeItem));
      setBills(billingsRes.data.map(sanitizeItem));
      setVitals(vitalsRes.data.map(sanitizeItem));
      setUsers(usersRes.data.map(sanitizeItem));
    } catch (error) {
      console.error("Failed to load clinical database tables", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const addPatient = async (newPatient: Omit<Patient, 'id' | 'status'>) => {
    try {
      const response = await api.post('/patients', {
        ...newPatient,
        status: 'Inpatient', // Default
        assignedDoctorId: newPatient.assignedDoctorId ? parseInt(newPatient.assignedDoctorId) : null
      });
      const created = sanitizeItem(response.data);
      setPatients(prev => [created, ...prev]);
    } catch (e) {
      console.error("Error creating patient", e);
    }
  };

  const updatePatient = async (id: string, updatedFields: Partial<Patient>) => {
    try {
      const existing = patients.find(p => p.id === id);
      if (!existing) return;
      const merged = { ...existing, ...updatedFields };
      await api.put(`/patients/${id}`, {
        ...merged,
        id: parseInt(id),
        assignedDoctorId: merged.assignedDoctorId ? parseInt(merged.assignedDoctorId) : null
      });
      setPatients(prev => prev.map(p => p.id === id ? sanitizeItem(merged) : p));
    } catch (e) {
      console.error("Error updating patient", e);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await api.delete(`/patients/${id}`);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error deleting patient", e);
    }
  };

  const addPrescription = async (newPresc: Omit<Prescription, 'id' | 'date' | 'status'>) => {
    try {
      const response = await api.post('/prescriptions', {
        patientId: parseInt(newPresc.patientId),
        doctorId: parseInt(newPresc.doctorId),
        recordId: newPresc.recordId.startsWith('mr-') || newPresc.recordId === 'rec-direct' ? 1 : parseInt(newPresc.recordId), // Map mock record ID to seed record ID
        status: 'Active',
        date: new Date().toISOString(),
        medications: newPresc.medications
      });
      const created = sanitizeItem(response.data);
      setPrescriptions(prev => [created, ...prev]);
    } catch (e) {
      console.error("Error adding prescription", e);
    }
  };

  const updatePrescription = async (id: string, updatedFields: Partial<Prescription>) => {
    try {
      const existing = prescriptions.find(p => p.id === id);
      if (!existing) return;
      const merged = { ...existing, ...updatedFields };

      await api.put(`/prescriptions/${id}`, {
        id: parseInt(id),
        patientId: parseInt(merged.patientId),
        doctorId: parseInt(merged.doctorId),
        recordId: merged.recordId.startsWith('mr-') || merged.recordId === 'rec-direct' ? 1 : parseInt(merged.recordId),
        status: merged.status,
        date: merged.date.includes('T') ? merged.date : new Date(merged.date).toISOString(),
        medications: merged.medications.map((med: any) => ({
          id: med.id ? parseInt(med.id) : 0,
          prescriptionId: parseInt(id),
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions
        }))
      });

      setPrescriptions(prev => prev.map(p => p.id === id ? sanitizeItem(merged) : p));
    } catch (e) {
      console.error("Error updating prescription", e);
    }
  };

  const deletePrescription = async (id: string) => {
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error deleting prescription", e);
    }
  };

  const addMedicalRecord = async (newRecord: Omit<MedicalRecord, 'id' | 'date'>) => {
    try {
      const response = await api.post('/medicalrecords', {
        patientId: parseInt(newRecord.patientId),
        doctorId: parseInt(newRecord.doctorId),
        diagnosis: newRecord.diagnosis,
        treatment: newRecord.treatment,
        notes: newRecord.notes,
        date: new Date().toISOString()
      });
      const created = sanitizeItem(response.data);
      setMedicalRecords(prev => [created, ...prev]);
    } catch (e) {
      console.error("Error adding medical record", e);
    }
  };

  const updateMedicalRecord = async (id: string, updatedFields: Partial<MedicalRecord>) => {
    setMedicalRecords(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
  };

  const addAppointment = async (newApt: Omit<Appointment, 'id'>) => {
    try {
      const response = await api.post('/appointments', {
        patientId: parseInt(newApt.patientId),
        doctorId: parseInt(newApt.doctorId),
        date: new Date(newApt.date).toISOString(),
        time: newApt.time + ":00",
        reason: newApt.reason,
        status: newApt.status
      });
      const created = sanitizeItem(response.data);
      setAppointments(prev => [created, ...prev]);
    } catch (e) {
      console.error("Error scheduling appointment", e);
    }
  };

  const updateAppointment = async (id: string, updatedFields: Partial<Appointment>) => {
    try {
      const existing = appointments.find(a => a.id === id);
      if (!existing) return;
      const merged = { ...existing, ...updatedFields };
      await api.put(`/appointments/${id}`, {
        ...merged,
        id: parseInt(id),
        patientId: parseInt(merged.patientId),
        doctorId: parseInt(merged.doctorId),
        date: new Date(merged.date).toISOString(),
        time: merged.time.includes(':') && merged.time.length === 5 ? merged.time + ":00" : merged.time
      });
      setAppointments(prev => prev.map(a => a.id === id ? sanitizeItem(merged) : a));
    } catch (e) {
      console.error("Error updating appointment", e);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await updateAppointment(id, { status });
  };

  const deleteAppointment = async (id: string) => {
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Error deleting appointment", e);
    }
  };

  const addBill = async (newBill: Omit<Billing, 'id' | 'date'>) => {
    try {
      const response = await api.post('/billings', {
        patientId: parseInt(newBill.patientId),
        amount: newBill.amount,
        status: newBill.status,
        date: new Date().toISOString(),
        items: newBill.items
      });
      const created = sanitizeItem(response.data);
      setBills(prev => [created, ...prev]);
    } catch (e) {
      console.error("Error creating bill invoice", e);
    }
  };

  const updateBill = async (id: string, updatedFields: Partial<Billing>) => {
    try {
      const existing = bills.find(b => b.id === id);
      if (!existing) return;
      const merged = { ...existing, ...updatedFields };
      
      await api.put(`/billings/${id}`, {
        id: parseInt(id),
        patientId: parseInt(merged.patientId),
        date: merged.date.includes('T') ? merged.date : new Date(merged.date).toISOString(),
        amount: merged.amount,
        status: merged.status,
        items: merged.items.map((item: any) => ({
          id: item.id ? parseInt(item.id) : 0,
          billingId: parseInt(id),
          description: item.description,
          cost: item.cost
        }))
      });
      
      setBills(prev => prev.map(b => b.id === id ? { ...merged } : b));
    } catch (e) {
      console.error("Error updating bill", e);
    }
  };

  const deleteBill = async (id: string) => {
    try {
      await api.delete(`/billings/${id}`);
      setBills(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      console.error("Error deleting bill", e);
    }
  };

  const addVitals = async (newVitals: Omit<Vitals, 'id' | 'date' | 'time'>) => {
    try {
      const response = await api.post('/vitals', {
        patientId: parseInt(newVitals.patientId),
        recordedById: parseInt(newVitals.recordedBy),
        temperature: newVitals.temperature,
        bloodPressure: newVitals.bloodPressure,
        heartRate: newVitals.heartRate,
        respiratoryRate: newVitals.respiratoryRate,
        oxygenSaturation: newVitals.oxygenSaturation,
        weight: newVitals.weight,
        height: newVitals.height,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      const created = sanitizeItem(response.data);
      setVitals(prev => [created, ...prev]);
    } catch (e) {
      console.error("Error creating vitals entry", e);
    }
  };

  const updateVitals = async (id: string, updatedFields: Omit<Vitals, 'id' | 'date' | 'time'>) => {
    try {
      const existing = vitals.find(v => v.id === id);
      if (!existing) return;

      const payload = {
        id: parseInt(id),
        patientId: parseInt(updatedFields.patientId),
        recordedById: parseInt(updatedFields.recordedBy),
        temperature: updatedFields.temperature,
        bloodPressure: updatedFields.bloodPressure,
        heartRate: updatedFields.heartRate,
        respiratoryRate: updatedFields.respiratoryRate,
        oxygenSaturation: updatedFields.oxygenSaturation,
        weight: updatedFields.weight,
        height: updatedFields.height,
        date: existing.date.includes('T') ? existing.date : new Date(existing.date).toISOString(),
        time: existing.time
      };

      await api.put(`/vitals/${id}`, payload);
      const updated = sanitizeItem(payload);
      setVitals(prev => prev.map(v => v.id === id ? updated : v));
    } catch (e) {
      console.error("Error updating vitals", e);
    }
  };

  const deleteVitals = async (id: string) => {
    try {
      await api.delete(`/vitals/${id}`);
      setVitals(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      console.error("Error deleting vitals", e);
    }
  };

  return (
    <CaseRecordsContext.Provider value={{ 
      patients,
      prescriptions, 
      medicalRecords, 
      appointments,
      bills,
      addPatient,
      updatePatient,
      deletePatient,
      addPrescription, 
      updatePrescription,
      deletePrescription,
      addMedicalRecord,
      updateMedicalRecord,
      addAppointment,
      updateAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      addBill,
      updateBill,
      deleteBill,
      vitals,
      users,
      doctors,
      addVitals,
      updateVitals,
      deleteVitals
    }}>
      {children}
    </CaseRecordsContext.Provider>
  );
};

export const useCaseRecords = () => {
  const context = useContext(CaseRecordsContext);
  if (!context) {
    throw new Error('useCaseRecords must be used within a CaseRecordsProvider');
  }
  return context;
};
