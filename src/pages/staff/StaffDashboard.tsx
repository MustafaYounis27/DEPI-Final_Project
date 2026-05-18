
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Plus, 
  MoreVertical,
  Activity,
  Edit2,
  Trash2,
  FileText,
  X,
  Check
} from 'lucide-react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../../components/Modal';
import { Patient } from '../../types';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { patients, updatePatient, deletePatient, addAppointment, appointments, bills, doctors } = useCaseRecords();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form States - Appointment
  const [aptPatientId, setAptPatientId] = useState('');
  const [aptDoctorId, setAptDoctorId] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('');
  const [aptReason, setAptReason] = useState('');
  
  // Filter for patients who might be considered "Recent Admissions" 
  // For this demo, let's just show those marked as Inpatient
  const recentAdmissions = patients.filter(p => p.status === 'Inpatient').slice(0, 5);

  const pendingBills = bills.filter(b => b.status === 'Unpaid');
  const totalPendingAmount = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: <Users className="text-blue-600" />, detail: 'In database' },
    { label: 'Inpatients', value: patients.filter(p => p.status === 'Inpatient').length, icon: <Activity className="text-orange-600" />, detail: 'Currently admitted' },
    { label: 'Appointments', value: appointments.length, icon: <Calendar className="text-purple-600" />, detail: 'Total scheduled' },
    { label: 'Pending Bills', value: pendingBills.length, icon: <CreditCard className="text-orange-600" />, detail: `$${totalPendingAmount.toFixed(0)} Total` },
  ];

  const handleDischarge = (id: string) => {
    if (confirm('Are you sure you want to discharge this patient?')) {
      // In this app, we'll just set them to Outpatient so they leave the "Recent Admissions" (Inpatient) list
      updatePatient(id, { status: 'Outpatient' });
      setActiveMenu(null);
    }
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptPatientId || !aptDoctorId || !aptDate || !aptTime) return;

    addAppointment({
        patientId: aptPatientId,
        doctorId: aptDoctorId,
        date: aptDate,
        time: aptTime,
        reason: aptReason,
        status: 'Scheduled'
    });

    setIsSuccess(true);
    setTimeout(() => {
        setIsSuccess(false);
        setIsAptModalOpen(false);
        // Reset form
        setAptPatientId('');
        setAptDoctorId('');
        setAptDate('');
        setAptTime('');
        setAptReason('');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Center</h1>
          <p className="text-gray-500">Manage patient check-ins and facility resources.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/staff/appointments')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
          >
            <Calendar size={18} />
            Schedule Appointment
          </button>
          <button 
            onClick={() => navigate('/staff/registration')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            Register Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium">{stat.detail}</p>
          </motion.div>
        ))}
      </div>

      <div>
        {/* Recent Admissions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Admissions</h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {recentAdmissions.length > 0 ? recentAdmissions.map((patient) => (
                <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-400">Time: 10:45 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      patient.status === 'Inpatient' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {patient.status}
                    </span>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === patient.id ? null : patient.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === patient.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenu(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-20"
                            >
                              <button 
                                onClick={() => {
                                  setViewingPatient(patient);
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FileText size={14} /> View Details
                              </button>
                              <div className="my-1 border-t border-gray-50" />
                              <button 
                                onClick={() => handleDischarge(patient.id)}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Discharge
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 font-medium">
                  No recent inpatient admissions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal isOpen={!!viewingPatient} onClose={() => setViewingPatient(null)} title="Patient Details">
        {viewingPatient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                {viewingPatient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewingPatient.name}</h3>
                <p className="text-gray-500">{viewingPatient.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Phone</p>
                <p className="font-bold text-gray-900">{viewingPatient.phone}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">D.O.B</p>
                <p className="font-bold text-gray-900">{viewingPatient.dateOfBirth}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Blood Group</p>
                <p className="font-bold text-red-600">{viewingPatient.bloodGroup}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gender</p>
                <p className="font-bold text-gray-900">{viewingPatient.gender}</p>
              </div>
              {viewingPatient.insuranceId && (
                <div className="p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Insurance ID</p>
                  <p className="font-bold text-gray-900">{viewingPatient.insuranceId}</p>
                </div>
              )}
              {viewingPatient.emergencyContact && (
                <div className="p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Emergency Contact</p>
                  <p className="font-bold text-gray-900">{viewingPatient.emergencyContact}</p>
                </div>
              )}
              <div className="col-span-2 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Address</p>
                <p className="font-bold text-gray-900">{viewingPatient.address}</p>
              </div>
              {viewingPatient.allergies && (
                <div className="col-span-2 p-4 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Allergies</p>
                  <p className="font-bold text-red-700">{viewingPatient.allergies}</p>
                </div>
              )}
              {viewingPatient.chronicDiseases && (
                <div className="col-span-2 p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Chronic Diseases</p>
                  <p className="font-bold text-orange-700">{viewingPatient.chronicDiseases}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setViewingPatient(null)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Schedule Appointment Modal */}
      <Modal isOpen={isAptModalOpen} onClose={() => setIsAptModalOpen(false)} title="Schedule New Appointment">
        <form onSubmit={handleAppointmentSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Patient</label>
            <select 
              required
              value={aptPatientId}
              onChange={(e) => setAptPatientId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Doctor</label>
            <select 
              required
              value={aptDoctorId}
              onChange={(e) => setAptDoctorId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a doctor...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'General'})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date</label>
              <input 
                required
                type="date" 
                value={aptDate}
                onChange={(e) => setAptDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time</label>
              <input 
                required
                type="time" 
                value={aptTime}
                onChange={(e) => setAptTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reason for Appointment</label>
            <textarea 
              required
              rows={3} 
              value={aptReason}
              onChange={(e) => setAptReason(e.target.value)}
              placeholder="e.g. Fever, Follow-up, Routine Checkup..." 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>
          <button 
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
              isSuccess ? 'bg-green-600 shadow-green-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
            }`}
          >
            {isSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={20} /> Appointment Scheduled!
              </span>
            ) : 'Confirm Appointment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

