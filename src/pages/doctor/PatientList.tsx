
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  FileText, 
  History,
  Mail,
  Phone,
  X,
  Plus,
  Check,
  Clipboard,
  Activity,
  ShieldAlert,
  FileDigit,
  Trash2,
  Edit,
  Printer,
  CheckCircle2,
  Pill,
  Clock,
  Calendar as CalendarIcon,
  Download,
  Edit2
} from 'lucide-react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, MedicalRecord, Prescription } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, medicalRecords, addMedicalRecord, updateMedicalRecord, prescriptions, updatePrescription, deletePrescription, addPrescription, vitals } = useCaseRecords();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Inpatient' | 'Outpatient'>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [addingRecordTo, setAddingRecordTo] = useState<Patient | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [manualPatientId, setManualPatientId] = useState('');
  
  const [pendingRecords, setPendingRecords] = useState([{ diagnosis: '', treatment: '', notes: '' }]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activePrescriptionMenu, setActivePrescriptionMenu] = useState<string | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);

  // Prescription Form State
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [prescriptionMedications, setPrescriptionMedications] = useState<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string; }[]>([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);

  const resetPrescriptionForm = () => {
    setPrescriptionMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setEditingPrescription(null);
    setIsPrescriptionFormOpen(false);
  };

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingPatient || prescriptionMedications.some(m => !m.name)) return;

    if (editingPrescription) {
      updatePrescription(editingPrescription.id, {
        medications: prescriptionMedications,
      });
    } else {
      addPrescription({
        patientId: viewingPatient.id,
        doctorId: user?.id || '1',
        recordId: 'rec-direct', // Direct prescription without record linkage for now
        medications: prescriptionMedications,
      });
    }
    resetPrescriptionForm();
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    // Basic CSV export for filtered patients
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Blood Group', 'Last Visit'];
    const rows = filteredPatients.map(p => [p.id, p.name, p.email, p.phone, p.status, p.bloodGroup, p.lastVisit]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRecord) {
      updateMedicalRecord(editingRecord.id, {
        diagnosis: pendingRecords[0].diagnosis,
        treatment: pendingRecords[0].treatment,
        notes: pendingRecords[0].notes
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setEditingRecord(null);
        setPendingRecords([{ diagnosis: '', treatment: '', notes: '' }]);
      }, 1500);
      return;
    }

    const patientId = addingRecordTo?.id === 'SELECT' ? manualPatientId : addingRecordTo?.id;
    
    // Filter out empty pending records
    const validRecords = pendingRecords.filter(r => r.diagnosis.trim() !== '');
    
    if (!patientId || validRecords.length === 0) return;

    validRecords.forEach(record => {
      addMedicalRecord({
        patientId,
        doctorId: user?.id || '1',
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        notes: record.notes
      });
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAddingRecordTo(null);
      setManualPatientId('');
      setPendingRecords([{ diagnosis: '', treatment: '', notes: '' }]);
    }, 1500);
  };

  const updatePendingRecord = (index: number, fields: Partial<{ diagnosis: string, treatment: string, notes: string }>) => {
    setPendingRecords(prev => prev.map((r, i) => i === index ? { ...r, ...fields } : r));
  };

  const addAnotherEntry = () => {
    setPendingRecords(prev => [...prev, { diagnosis: '', treatment: '', notes: '' }]);
  };

  const removeEntry = (index: number) => {
    if (pendingRecords.length > 1) {
      setPendingRecords(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleEditInit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setPendingRecords([{ 
      diagnosis: record.diagnosis, 
      treatment: record.treatment, 
      notes: record.notes || '' 
    }]);
    setViewingPatient(null);
  };

  const currentPatientRecords = viewingPatient 
    ? medicalRecords.filter(r => r.patientId === viewingPatient.id)
    : [];

  const currentPatientPrescriptions = viewingPatient
    ? prescriptions.filter(p => p.patientId === viewingPatient.id)
    : [];

  const currentPatientVitals = viewingPatient
    ? vitals.filter(v => v.patientId === viewingPatient.id).sort((a, b) => 
        new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      )
    : [];

  const handlePrint = (presc: Prescription) => {
    console.log('Printing prescription:', presc.id);
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-600';
      case 'Dispensed': return 'bg-green-100 text-green-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-500">Manage and view your assigned patients.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 shadow-sm"
          >
            <Download size={20} />
            Export List
          </button>
          <button 
            onClick={() => setAddingRecordTo({ id: 'SELECT', name: 'New Case' } as any)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            New Medical Record
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all font-bold border ${
              statusFilter !== 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
            }`}
          >
            <Filter size={18} />
            {statusFilter === 'All' ? 'Filters' : statusFilter}
          </button>
          
          <AnimatePresence>
            {showFilterDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-10"
              >
                {['All', 'Inpatient', 'Outpatient'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      statusFilter === status ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setViewingPatient(patient)}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-sm">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="relative group/menu">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Menu remains visible due to hover but we stop bubble up
                    }}
                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg group-hover:text-blue-600 transition-all"
                  >
                    <MoreVertical size={20} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingRecordTo(patient);
                      }}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                    >
                      <Plus size={16} /> Add Medical Record
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // For "Edit Record", we'll open the records view as a starting point or just a toast
                        setViewingPatient(patient);
                      }}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                    >
                      <Clipboard size={16} /> Edit Records
                    </button>
                    <div className="my-1 border-t border-gray-50"></div>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                       <Trash2 size={16} /> Remove Patient
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    patient.status === 'Inpatient' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {patient.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">ID: {patient.id}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <History size={16} className="text-gray-400" />
                  <span>Last Visit: {patient.lastVisit}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {patient.bloodGroup}
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingPatient(patient);
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all"
                >
                  View Records
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Medical Record Modal */}
      <Modal 
        isOpen={!!addingRecordTo || !!editingRecord} 
        onClose={() => {
          setAddingRecordTo(null);
          setEditingRecord(null);
          setManualPatientId('');
          setPendingRecords([{ diagnosis: '', treatment: '', notes: '' }]);
        }} 
        title={editingRecord ? `Edit Medical Record` : (addingRecordTo?.id === 'SELECT' ? "Add Medical Record" : `Add Medical Record - ${addingRecordTo?.name}`)}
      >
        <form onSubmit={handleAddRecord} className="space-y-6">
          {addingRecordTo?.id === 'SELECT' && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Patient</label>
              <select 
                required
                value={manualPatientId}
                onChange={(e) => setManualPatientId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              >
                <option value="">Select a patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
            {pendingRecords.map((record, index) => (
              <div key={index} className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 relative group">
                {!editingRecord && pendingRecords.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Entry #{index + 1} - Diagnosis</label>
                  <input 
                    required
                    type="text" 
                    value={record.diagnosis}
                    onChange={(e) => updatePendingRecord(index, { diagnosis: e.target.value })}
                    placeholder="e.g. Chronic Hypertension" 
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Treatment Plan</label>
                  <textarea 
                    rows={2} 
                    value={record.treatment}
                    onChange={(e) => updatePendingRecord(index, { treatment: e.target.value })}
                    placeholder="Describe the treatment..." 
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Clinical Notes</label>
                  <textarea 
                    rows={2} 
                    value={record.notes}
                    onChange={(e) => updatePendingRecord(index, { notes: e.target.value })}
                    placeholder="Add any additional notes..." 
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                  ></textarea>
                </div>
              </div>
            ))}
          </div>

          {!editingRecord && (
            <button 
              type="button"
              onClick={addAnotherEntry}
              className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:border-blue-200 hover:text-blue-500 transition-all group"
            >
              <Plus size={16} className="group-hover:scale-110 transition-transform" />
              Add Another Medical Entry
            </button>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            {isSuccess ? <><Check size={18} /> Records Saved</> : (editingRecord ? 'Update Medical Record' : 'Save All Records')}
          </button>
        </form>
      </Modal>

      {/* View Records Modal */}
      <Modal
        isOpen={!!viewingPatient}
        onClose={() => setViewingPatient(null)}
        title={`Medical History: ${viewingPatient?.name}`}
      >
        <div className="space-y-8">
          {/* Medical Alerts */}
          {(viewingPatient?.allergies || viewingPatient?.chronicDiseases) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {viewingPatient.allergies && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                  <ShieldAlert size={18} className="text-red-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Allergies</p>
                    <p className="text-sm font-bold text-red-700">{viewingPatient.allergies}</p>
                  </div>
                </div>
              )}
              {viewingPatient.chronicDiseases && (
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                  <Activity size={18} className="text-orange-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Chronic Conditions</p>
                    <p className="text-sm font-bold text-orange-700">{viewingPatient.chronicDiseases}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
               <p className="text-xs font-bold text-blue-400 uppercase">Records</p>
               <p className="text-xl font-bold text-blue-600">{currentPatientRecords.length}</p>
             </div>
             <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
               <p className="text-xs font-bold text-purple-400 uppercase">Prescriptions</p>
               <p className="text-xl font-bold text-purple-600">{currentPatientPrescriptions.length}</p>
             </div>
             <div className="p-4 bg-red-50 rounded-2xl border border-red-100 col-span-2 lg:col-span-1">
               <p className="text-xs font-bold text-red-400 uppercase">Vital Checks</p>
               <p className="text-xl font-bold text-red-600">{currentPatientVitals.length}</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-red-500" />
                Latest Vitals
              </h4>
              <button 
                onClick={() => navigate('/doctor/vitals')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Update Vitals
              </button>
            </div>
            {currentPatientVitals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Temp</p>
                  <p className="text-sm font-bold text-gray-900">{currentPatientVitals[0].temperature}°C</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Pulse</p>
                  <p className="text-sm font-bold text-gray-900">{currentPatientVitals[0].heartRate} bpm</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">B.P.</p>
                  <p className="text-sm font-bold text-gray-900">{currentPatientVitals[0].bloodPressure}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Respiration</p>
                  <p className="text-sm font-bold text-gray-900">{currentPatientVitals[0].respiratoryRate}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">SpO2</p>
                  <p className="text-sm font-bold text-gray-900">{currentPatientVitals[0].oxygenSaturation}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Recorded</p>
                  <p className="text-[10px] font-bold text-gray-600">{currentPatientVitals[0].date}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No vitals on record.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Clipboard size={18} className="text-blue-500" />
                Medical Records
              </h4>
            </div>
            {currentPatientRecords.length > 0 ? (
              <div className="space-y-4">
                {currentPatientRecords.map(record => (
                  <div key={record.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-gray-800">{record.diagnosis}</h5>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditInit(record)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Record"
                        >
                          <Edit size={14} />
                        </button>
                        <span className="text-[10px] text-gray-400 font-mono">{record.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2"><span className="font-bold text-xs uppercase text-gray-400 block mb-0.5">Treatment:</span> {record.treatment}</p>
                    {record.notes && (
                       <p className="text-sm text-gray-500 italic"><span className="font-bold text-xs uppercase text-gray-400 block mb-0.5">Notes:</span> {record.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No medical records found.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FileDigit size={18} className="text-purple-500" />
                Prescriptions
              </h4>
              <button 
                onClick={() => setIsPrescriptionFormOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> New Prescription
              </button>
            </div>
            <div className="space-y-4">
              {currentPatientPrescriptions.map(p => (
                <div key={p.id} className="relative flex justify-between items-center p-3 bg-purple-50/30 rounded-xl group/presc">
                  <div>
                    <p className="text-sm font-bold text-gray-700">{p.medications[0].name}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                       {p.medications[0].dosage} • {p.medications[0].frequency}
                       <span className={`px-1.5 py-0.5 rounded-full ${getStatusColor(p.status)} font-bold`}>
                         {p.status}
                       </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-400">{p.date}</span>
                    <div className="relative">
                      <button 
                        onClick={() => setActivePrescriptionMenu(activePrescriptionMenu === p.id ? null : p.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      <AnimatePresence>
                        {activePrescriptionMenu === p.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActivePrescriptionMenu(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-20"
                            >
                              <button 
                                onClick={() => {
                                  setEditingPrescription(p);
                                  setPrescriptionMedications(p.medications);
                                  setIsPrescriptionFormOpen(true);
                                  setActivePrescriptionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 size={14} /> Edit Prescription
                              </button>
                              <button 
                                onClick={() => {
                                  setViewingPrescription(p);
                                  setActivePrescriptionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FileText size={14} /> View Details
                              </button>
                              <button 
                                onClick={() => {
                                  handlePrint(p);
                                  setActivePrescriptionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Printer size={14} /> Print
                              </button>
                              {p.status === 'Active' && (
                                <button 
                                  onClick={() => {
                                    updatePrescription(p.id, { status: 'Dispensed' });
                                    setActivePrescriptionMenu(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <CheckCircle2 size={14} /> Mark Dispensed
                                </button>
                              )}
                              <div className="my-1 border-t border-gray-50" />
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this prescription?')) {
                                    deletePrescription(p.id);
                                  }
                                  setActivePrescriptionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Remove Prescription
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Prescription Detail Popup (Nested) */}
      <Modal
        isOpen={!!viewingPrescription}
        onClose={() => setViewingPrescription(null)}
        title="Prescription Details"
      >
        {viewingPrescription && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Patient</p>
                  <p className="font-bold text-gray-900">{viewingPatient?.name}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date</p>
                  <p className="font-bold text-gray-900">{viewingPrescription.date}</p>
               </div>
            </div>

            <div className="space-y-3">
               <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Pill size={16} className="text-blue-500" />
                  Prescribed Medications
               </h4>
               <div className="space-y-2">
                  {viewingPrescription.medications.map((med, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm space-y-2">
                        <div className="flex justify-between">
                            <p className="font-bold text-gray-900">{med.name}</p>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase">{med.dosage}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock size={12} />
                                {med.frequency}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <CalendarIcon size={12} />
                                {med.duration}
                            </div>
                        </div>
                        {med.instructions && (
                           <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg italic">
                             Note: {med.instructions}
                           </p>
                        )}
                    </div>
                  ))}
               </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
               <div className="flex gap-3">
                  <button 
                    onClick={() => handlePrint(viewingPrescription)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    <Printer size={18} /> Print
                  </button>
                  {viewingPrescription.status === 'Active' && (
                    <button 
                      onClick={() => {
                        updatePrescription(viewingPrescription.id, { status: 'Dispensed' });
                        setViewingPrescription(null);
                      }}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      <Check size={18} /> Dispense
                    </button>
                  )}
               </div>
               <button 
                 onClick={() => {
                   if (confirm('Are you sure you want to delete this prescription?')) {
                     deletePrescription(viewingPrescription.id);
                     setViewingPrescription(null);
                   }
                 }}
                 className="w-full py-3 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-all"
               >
                 <Trash2 size={18} /> Delete Prescription
               </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Internal Prescription Form Modal */}
      <Modal
        isOpen={isPrescriptionFormOpen}
        onClose={resetPrescriptionForm}
        title={editingPrescription ? "Edit Prescription" : "New Prescription"}
      >
        <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
           <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
             <p className="text-[10px] uppercase font-bold text-blue-400">Patient</p>
             <p className="font-bold text-blue-900">{viewingPatient?.name}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Medications</label>
              <button 
                type="button"
                onClick={() => setPrescriptionMedications([...prescriptionMedications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add Another
              </button>
            </div>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {prescriptionMedications.map((med, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-3 relative">
                  {prescriptionMedications.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => setPrescriptionMedications(prescriptionMedications.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Medication Name</label>
                      <input 
                        type="text"
                        placeholder="Medication Name"
                        required
                        value={med.name}
                        onChange={(e) => {
                          const newMeds = [...prescriptionMedications];
                          newMeds[index].name = e.target.value;
                          setPrescriptionMedications(newMeds);
                        }}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dosage</label>
                      <input 
                        type="text"
                        placeholder="Dosage"
                        required
                        value={med.dosage}
                        onChange={(e) => {
                          const newMeds = [...prescriptionMedications];
                          newMeds[index].dosage = e.target.value;
                          setPrescriptionMedications(newMeds);
                        }}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Frequency</label>
                      <input 
                        type="text"
                        placeholder="Frequency"
                        required
                        value={med.frequency}
                        onChange={(e) => {
                          const newMeds = [...prescriptionMedications];
                          newMeds[index].frequency = e.target.value;
                          setPrescriptionMedications(newMeds);
                        }}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duration</label>
                    <input 
                      type="text"
                      placeholder="Duration"
                      required
                      value={med.duration}
                      onChange={(e) => {
                        const newMeds = [...prescriptionMedications];
                        newMeds[index].duration = e.target.value;
                        setPrescriptionMedications(newMeds);
                      }}
                      className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Special Instructions</label>
                    <textarea 
                      placeholder="Optional notes..."
                      value={med.instructions}
                      onChange={(e) => {
                        const newMeds = [...prescriptionMedications];
                        newMeds[index].instructions = e.target.value;
                        setPrescriptionMedications(newMeds);
                      }}
                      className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm h-16 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            {editingPrescription ? 'Update Prescription' : 'Create Prescription'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
