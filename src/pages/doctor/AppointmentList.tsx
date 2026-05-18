import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Check,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';

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
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const AppointmentList: React.FC = () => {
  const { user } = useAuth();
  const { patients, appointments, addAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment, doctors } = useCaseRecords();
  
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Pending'>('Upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState<Appointment | null>(null);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [aptDoctorId, setAptDoctorId] = useState(user?.id?.toString() || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const filteredAppointments = appointments.filter(apt => {
    const patient = patients.find(p => p.id === apt.patientId);
    const matchesSearch = (patient?.name || 'System').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'Upcoming') return apt.status === 'Scheduled';
    if (activeTab === 'Past') return apt.status === 'Completed' || apt.status === 'Cancelled';
    if (activeTab === 'Pending') return apt.status === 'Pending';
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRescheduling) {
        updateAppointment(isRescheduling.id, {
            doctorId: aptDoctorId,
            date,
            time,
            reason,
            status: 'Scheduled'
        });
        setIsRescheduling(null);
    } else {
        addAppointment({
            patientId,
            doctorId: aptDoctorId,
            date,
            time,
            reason,
            status: 'Scheduled'
        });
    }
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setPatientId('');
    setAptDoctorId(user?.id?.toString() || '');
    setDate('');
    setTime('');
    setReason('');
    setIsRescheduling(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Completed': return 'text-green-600 bg-green-50 border-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
      case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled': return <CalendarIcon size={14} />;
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      case 'Pending': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage your patient consultations and schedules.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200/50"
        >
          <Plus size={20} />
          New Appointment
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
          {['Upcoming', 'Past', 'Pending'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.map((apt, index) => {
                const patient = patients.find(p => p.id === apt.patientId);
                const doctor = doctors.find(d => d.id === apt.doctorId);
                return (
                  <motion.tr 
                    key={apt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                          {patient?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{patient?.name || 'Unknown Patient'}</p>
                          <p className="text-xs text-gray-400">ID: {apt.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 text-[10px] font-bold">
                          {doctor?.name?.charAt(0) || 'D'}
                        </div>
                        <p className="text-sm font-medium text-gray-700">{doctor?.name || 'Assigned Doctor'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <CalendarIcon size={14} className="text-gray-400" />
                          {apt.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock size={14} className="text-gray-400" />
                          {apt.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{apt.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                        {getStatusIcon(apt.status)}
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative group/menu inline-block">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all z-10 text-left">
                          {apt.status === 'Pending' && (
                            <button 
                              onClick={() => updateAppointmentStatus(apt.id, 'Scheduled')}
                              className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2"
                            >
                              <Check size={16} /> Confirm Appointment
                            </button>
                          )}
                          {apt.status === 'Scheduled' && (
                            <button 
                               onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                               className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <CheckCircle2 size={16} /> Mark Completed
                            </button>
                          )}
                          <button 
                            onClick={() => {
                                setPatientId(apt.patientId);
                                setReason(apt.reason);
                                setDate(apt.date);
                                setTime(apt.time);
                                setIsRescheduling(apt);
                                setIsModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CalendarDays size={16} /> Reschedule
                          </button>
                          <button 
                            onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                            className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <XCircle size={16} /> Cancel Appointment
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredAppointments.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                        No appointments found for this category.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Reschedule Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isRescheduling ? 'Reschedule Appointment' : 'New Appointment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isRescheduling && (
            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Patient</label>
                <select 
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                >
                    <option value="">Select Patient...</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                </select>
            </div>
          )}
          <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Doctor</label>
              <select 
                  required
                  value={aptDoctorId}
                  onChange={(e) => setAptDoctorId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              >
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'General'})</option>
                  ))}
              </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Date</label>
                <input 
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Time</label>
                <input 
                    required
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Reason for Visit</label>
            <textarea 
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Routine Checkup, Follow-up..."
                className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 resize-none"
            ></textarea>
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-2"
          >
            {isRescheduling ? 'Confirm Rescheduling' : 'Schedule Appointment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
