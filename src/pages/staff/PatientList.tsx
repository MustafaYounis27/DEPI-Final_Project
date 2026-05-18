
import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  Mail,
  Phone,
  FileText,
  Edit2,
  Trash2,
  Calendar,
  Activity,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { Modal } from '../../components/Modal';
import { Patient } from '../../types';

export const StaffPatientList: React.FC = () => {
  const navigate = useNavigate();
  const { patients, updatePatient, deletePatient, vitals } = useCaseRecords();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Inpatient' | 'Outpatient'>('All');
  const [bloodFilter, setBloodFilter] = useState('All');

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesBlood = bloodFilter === 'All' || p.bloodGroup === bloodFilter;
    
    return matchesSearch && matchesStatus && matchesBlood;
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatient(editingPatient.id, editingPatient);
      setEditingPatient(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Directory</h1>
          <p className="text-gray-500">Manage all registered patients and their records.</p>
        </div>
        <button 
          onClick={() => navigate('/staff/registration')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
        >
          <UserPlus size={18} />
          Register New Patient
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-600 text-sm outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Inpatient">Inpatient</option>
              <option value="Outpatient">Outpatient</option>
            </select>
            <select 
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-600 text-sm outline-none cursor-pointer"
            >
              <option value="All">All Blood Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">D.O.B / Blood</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">ID: {patient.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {patient.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 font-medium">{patient.dateOfBirth}</p>
                      <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100">
                        {patient.bloodGroup}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      patient.status === 'Inpatient' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === patient.id ? null : patient.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
                      >
                        <MoreVertical size={20} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === patient.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-20"
                            >
                              <button 
                                onClick={() => { setViewingPatient(patient); setActiveMenu(null); }}
                                className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FileText size={16} /> View Details
                              </button>
                              <button 
                                onClick={() => { setEditingPatient(patient); setActiveMenu(null); }}
                                className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 size={16} /> Edit Info
                              </button>
                              <div className="my-1 border-t border-gray-50" />
                              <button 
                                onClick={() => {
                                  if(confirm('Delete patient record? This cannot be undone.')) {
                                    deletePatient(patient.id);
                                  }
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Delete Record
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No patients found</h3>
              <p className="text-gray-500">No records match your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details View Modal */}
      <Modal isOpen={!!viewingPatient} onClose={() => setViewingPatient(null)} title="Patient File">
        {viewingPatient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 text-3xl font-bold">
                {viewingPatient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{viewingPatient.name}</h3>
                <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  viewingPatient.status === 'Inpatient' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {viewingPatient.status}
                </span>
                <p className="text-gray-500 mt-1">{viewingPatient.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Phone</p>
                <p className="font-bold text-gray-900">{viewingPatient.phone}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Date of Birth</p>
                <p className="font-bold text-gray-900">{viewingPatient.dateOfBirth}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl font-bold">
                <p className="text-[10px] uppercase font-bold text-gray-400">Blood Group</p>
                <p className="text-red-600">{viewingPatient.bloodGroup}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Gender</p>
                <p className="font-bold text-gray-900">{viewingPatient.gender}</p>
              </div>
              {viewingPatient.insuranceId && (
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Insurance ID</p>
                  <p className="font-bold text-gray-900">{viewingPatient.insuranceId}</p>
                </div>
              )}
              {viewingPatient.emergencyContact && (
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Emergency Contact</p>
                  <p className="font-bold text-gray-900">{viewingPatient.emergencyContact}</p>
                </div>
              )}
              <div className="col-span-2 p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Home Address</p>
                <p className="font-bold text-gray-900">{viewingPatient.address}</p>
              </div>
            </div>

            {/* Vitals Summary for Staff */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Latest Vitals</h4>
              {vitals.filter(v => v.patientId === viewingPatient.id).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {vitals.filter(v => v.patientId === viewingPatient.id)
                    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
                    .slice(0, 1)
                    .map(v => (
                      <React.Fragment key={v.id}>
                        <div className="p-3 bg-white border border-gray-100 rounded-xl">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Temp</p>
                          <p className="text-sm font-bold text-gray-900">{v.temperature}°C</p>
                        </div>
                        <div className="p-3 bg-white border border-gray-100 rounded-xl">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">B.P.</p>
                          <p className="text-sm font-bold text-gray-900">{v.bloodPressure}</p>
                        </div>
                        <div className="p-3 bg-white border border-gray-100 rounded-xl">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Heart</p>
                          <p className="text-sm font-bold text-gray-900">{v.heartRate}</p>
                        </div>
                        <div className="p-3 bg-white border border-gray-100 rounded-xl">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">SpO2</p>
                          <p className="text-sm font-bold text-gray-900">{v.oxygenSaturation}%</p>
                        </div>
                      </React.Fragment>
                    ))
                  }
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic px-4">No vital records available.</p>
              )}
            </div>

            {(viewingPatient.allergies || viewingPatient.chronicDiseases) && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medical Alerts</h4>
                <div className="grid grid-cols-1 gap-3">
                  {viewingPatient.allergies && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-red-400">Allergies</p>
                      <p className="font-bold text-red-700">{viewingPatient.allergies}</p>
                    </div>
                  )}
                  {viewingPatient.chronicDiseases && (
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-orange-400">Chronic Diseases</p>
                      <p className="font-bold text-orange-700">{viewingPatient.chronicDiseases}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button 
              onClick={() => setViewingPatient(null)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
            >
              Close Record
            </button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingPatient} onClose={() => setEditingPatient(null)} title="Edit Patient Information">
        {editingPatient && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <input 
                type="text" 
                value={editingPatient.name}
                onChange={e => setEditingPatient({...editingPatient, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                <input 
                  type="text" 
                  value={editingPatient.phone}
                  onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Blood Group</label>
                <input 
                  type="text" 
                  value={editingPatient.bloodGroup}
                  onChange={e => setEditingPatient({...editingPatient, bloodGroup: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
              <textarea 
                value={editingPatient.address}
                onChange={e => setEditingPatient({...editingPatient, address: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none h-20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Insurance ID</label>
                <input 
                  type="text" 
                  value={editingPatient.insuranceId || ''}
                  onChange={e => setEditingPatient({...editingPatient, insuranceId: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Emergency Contact</label>
                <input 
                  type="text" 
                  value={editingPatient.emergencyContact || ''}
                  onChange={e => setEditingPatient({...editingPatient, emergencyContact: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Allergies</label>
                <textarea 
                  value={editingPatient.allergies || ''}
                  onChange={e => setEditingPatient({...editingPatient, allergies: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none h-20 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Chronic Diseases</label>
                <textarea 
                  value={editingPatient.chronicDiseases || ''}
                  onChange={e => setEditingPatient({...editingPatient, chronicDiseases: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setEditingPatient(null)}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Save Updates
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
