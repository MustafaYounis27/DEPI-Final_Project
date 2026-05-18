
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  Activity, 
  ChevronRight,
  ClipboardList,
  X,
  Search,
  Check
} from 'lucide-react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, title, icon, color, children }) => {
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
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`${color} text-white p-2 rounded-xl`}>
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              </div>
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

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, appointments, addPrescription, prescriptions, addAppointment, doctors } = useCaseRecords();
  
  const [activeModal, setActiveModal] = useState<'prescription' | 'appointment' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form States - Prescription
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');

  // Form States - Appointment
  const [aptPatientId, setAptPatientId] = useState('');
  const [aptDoctorId, setAptDoctorId] = useState(user?.id?.toString() || '');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('');
  const [aptReason, setAptReason] = useState('');
  
  const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled').slice(0, 5);
  const totalPatientsCount = patients.length;

  const stats = [
    { label: 'Total Patients', value: totalPatientsCount, icon: <Users className="text-blue-600" />, change: '+2 this week' },
    { label: 'Pending Prescriptions', value: prescriptions.length, icon: <ClipboardList className="text-green-600" />, change: 'Recently added' },
    { label: 'Today\'s Consultations', value: '12', icon: <Clock className="text-orange-600" />, change: 'Next in 15m' },
  ];

  const handleAction = (label: string) => {
    if (label === 'Write Prescription') navigate('/doctor/prescriptions');
    if (label === 'Schedule Appointment') navigate('/doctor/appointments');
    if (label === 'Patient Vitals') navigate('/doctor/vitals');
    if (label === 'Update Records' || label === 'View All') navigate('/doctor/patients');
  };

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !medName) return;

    addPrescription({
      patientId: selectedPatient,
      doctorId: user?.id || '1',
      recordId: `mr-${Date.now()}`,
      medications: [{ name: medName, dosage, frequency, duration: '30 days' }]
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveModal(null);
      // Reset form
      setSelectedPatient('');
      setMedName('');
      setDosage('');
      setFrequency('');
      setNotes('');
    }, 1500);
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
        setActiveModal(null);
        // Reset form
        setAptPatientId('');
        setAptDoctorId(user?.id?.toString() || '');
        setAptDate('');
        setAptTime('');
        setAptReason('');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. Sarah</h1>
        <p className="text-gray-500">Here's what's happening in your clinic today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stats</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
              <p className="text-xs text-blue-600 mt-3 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-full">
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <button 
              onClick={() => navigate('/doctor/appointments')}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {upcomingAppointments.map((apt) => {
                const patient = patients.find(p => p.id === apt.patientId);
                const doctor = doctors.find(d => d.id === apt.doctorId);
                return (
                  <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
                        {patient?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{patient?.name}</p>
                        <p className="text-xs text-blue-600 font-medium">{doctor?.name}</p>
                        <p className="text-sm text-gray-500">{apt.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{apt.time}</p>
                      <p className="text-xs text-gray-400">{apt.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Write Prescription', icon: <ClipboardList />, color: 'bg-blue-600' },
              { label: 'Schedule Appointment', icon: <Calendar />, color: 'bg-orange-600' },
              { label: 'Patient Vitals', icon: <Activity />, color: 'bg-red-600' },
              { label: 'Update Records', icon: <Users />, color: 'bg-green-600' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => handleAction(action.label)}
                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`${action.color} text-white p-2 rounded-xl`}>
                    {React.cloneElement(action.icon as React.ReactElement<any>, { size: 20 })}
                  </div>
                  <span className="font-medium text-gray-700">{action.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Write Prescription Modal */}
      <QuickActionModal
        isOpen={activeModal === 'prescription'}
        onClose={() => setActiveModal(null)}
        title="Write Prescription"
        icon={<ClipboardList size={20} />}
        color="bg-blue-600"
      >
        <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Patient</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                required
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 appearance-none"
              >
                <option value="">Select a patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Medication Name</label>
            <input 
              required
              type="text" 
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg" 
              className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Dosage</label>
              <input 
                type="text" 
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet" 
                className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Frequency</label>
              <input 
                type="text" 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Twice a day" 
                className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Notes / Instructions</label>
            <textarea 
              rows={3} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional instructions..." 
              className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 resize-none"
            ></textarea>
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            {isSuccess ? <><Check size={18} /> Sent Successfully</> : 'Confirm & Save'}
          </button>
        </form>
      </QuickActionModal>
      
      {/* Schedule Appointment Modal */}
      <QuickActionModal
        isOpen={activeModal === 'appointment'}
        onClose={() => setActiveModal(null)}
        title="Schedule Appointment"
        icon={<Calendar size={20} />}
        color="bg-orange-600"
      >
        <form onSubmit={handleAppointmentSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Patient</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                required
                value={aptPatientId}
                onChange={(e) => setAptPatientId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 appearance-none"
              >
                <option value="">Select a patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Doctor</label>
            <select 
              required
              value={aptDoctorId}
              onChange={(e) => setAptDoctorId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 appearance-none"
            >
              <option value="">Select a doctor...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'General'})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Date</label>
              <input 
                required
                type="date" 
                value={aptDate}
                onChange={(e) => setAptDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Time</label>
              <input 
                required
                type="time" 
                value={aptTime}
                onChange={(e) => setAptTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Reason / Notes</label>
            <textarea 
              rows={3} 
              value={aptReason}
              onChange={(e) => setAptReason(e.target.value)}
              placeholder="e.g. Follow-up, Consultation..." 
              className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 resize-none"
            ></textarea>
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            {isSuccess ? <><Check size={18} /> Scheduled Successfully</> : 'Confirm Appointment'}
          </button>
        </form>
      </QuickActionModal>
    </div>
  );
};

