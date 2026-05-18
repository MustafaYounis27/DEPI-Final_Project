import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Download, 
  Filter, 
  Calendar,
  Pill,
  Clock,
  MoreVertical,
  Printer,
  Trash2,
  CheckCircle2,
  X,
  Stethoscope,
  ChevronRight,
  Check,
  Plus,
  Edit2
} from 'lucide-react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Prescription } from '../../types';

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
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const PrescriptionList: React.FC = () => {
  const { prescriptions, patients, updatePrescription, deletePrescription, addPrescription } = useCaseRecords();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  // Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medications, setMedications] = useState<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string; }[]>([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);

  const resetForm = () => {
    setSelectedPatient('');
    setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setEditingPrescription(null);
    setIsFormOpen(false);
  };

  const handleEdit = (presc: Prescription) => {
    setEditingPrescription(presc);
    setSelectedPatient(presc.patientId);
    setMedications(presc.medications);
    setIsFormOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || medications.some(m => !m.name)) return;

    if (editingPrescription) {
      updatePrescription(editingPrescription.id, {
        patientId: selectedPatient,
        medications: medications,
      });
    } else {
      addPrescription({
        patientId: selectedPatient,
        doctorId: user?.id || '1',
        recordId: 'rec-direct',
        medications: medications,
      });
    }
    resetForm();
  };

  const addMedicationRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicationRow = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    (newMeds[index] as any)[field] = value;
    setMedications(newMeds);
  };

  const filteredPrescriptions = prescriptions.filter(presc => {
    const patient = patients.find(p => p.id === presc.patientId);
    
    // Search Filter
    const matchesSearch = 
      patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      presc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presc.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Date Filter
    const matchesDate = dateFilter === '' || presc.date === dateFilter;

    // Status Filter
    const matchesStatus = statusFilter === 'All' || presc.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleExport = () => {
    const headers = ['Prescription ID', 'Patient Name', 'Date', 'Status', 'Medications'];
    const rows = filteredPrescriptions.map(p => {
      const patient = patients.find(pt => pt.id === p.patientId);
      const meds = p.medications.map(m => `${m.name} (${m.dosage} ${m.frequency})`).join('; ');
      return [p.id, patient?.name || 'Unknown', p.date, p.status, meds];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prescriptions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const patient = viewingPrescription ? patients.find(p => p.id === viewingPrescription.patientId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Prescriptions</h1>
          <p className="text-gray-500">View and manage all medications prescribed to patients.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            New Prescription
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 shadow-sm"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by patient name or medication..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-100 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-100 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Dispensed">Dispensed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Medication</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date / Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPrescriptions.map((presc, index) => {
                const patient = patients.find(p => p.id === presc.patientId);
                return (
                  <motion.tr 
                    key={presc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors group relative"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-400">#{presc.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                          {patient?.name?.charAt(0) || 'P'}
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{patient?.name || 'Unknown Patient'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {presc.medications?.map((med, i) => (
                          <div key={i} className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Pill size={14} className="text-blue-500" />
                              <span className="text-sm font-bold text-gray-700">{med.name}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 ml-6">{med.dosage} — {med.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{presc.date}</span>
                        <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(presc.status)}`}>
                          {presc.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === presc.id ? null : presc.id)}
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === presc.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveMenu(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20"
                              >
                                <button 
                                  onClick={() => handleEdit(presc)}
                                  className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit2 size={16} /> Edit Prescription
                                </button>
                                <button 
                                  onClick={() => {
                                    setViewingPrescription(presc);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <ClipboardList size={16} /> View Details
                                </button>
                                <button 
                                  onClick={() => {
                                    handlePrint(presc);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Printer size={16} /> Print Prescription
                                </button>
                                {presc.status === 'Active' && (
                                  <button 
                                    onClick={() => {
                                      updatePrescription(presc.id, { status: 'Dispensed' });
                                      setActiveMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                  >
                                    <CheckCircle2 size={16} /> Mark as Dispensed
                                  </button>
                                )}
                                <div className="my-1 border-t border-gray-50" />
                                <button 
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this prescription?')) {
                                      deletePrescription(presc.id);
                                    }
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={16} /> Remove Prescription
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredPrescriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    No prescriptions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  <p className="font-bold text-gray-900">{patient?.name || 'Unknown Patient'}</p>
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
                  {viewingPrescription.medications?.map((med, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm space-y-2 group">
                        <div className="flex justify-between">
                            <p className="font-bold text-gray-900">{med.name}</p>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase">{med.dosage}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock size={12} />
                                {med.frequency}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={12} />
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

      {/* Add/Edit Prescription Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={resetForm}
        title={editingPrescription ? "Edit Prescription" : "New Prescription"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Select Patient</label>
            <select
              required
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              disabled={!!editingPrescription}
              className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none disabled:opacity-50"
            >
              <option value="">Choose a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Medications</label>
              <button 
                type="button"
                onClick={addMedicationRow}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add Another
              </button>
            </div>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {medications.map((med, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-3 relative">
                  {medications.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeMedicationRow(index)}
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
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dosage</label>
                      <input 
                        type="text"
                        placeholder="e.g. 500mg"
                        required
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Frequency</label>
                      <input 
                        type="text"
                        placeholder="e.g. 2x daily"
                        required
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duration</label>
                    <input 
                      type="text"
                      placeholder="e.g. 7 days"
                      required
                      value={med.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Special Instructions</label>
                    <textarea 
                      placeholder="Optional notes..."
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
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
