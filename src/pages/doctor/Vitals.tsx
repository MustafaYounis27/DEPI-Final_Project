
import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Plus, 
  Thermometer, 
  Wind, 
  Heart, 
  Droplet, 
  Scale, 
  Maximize, 
  Check,
  Calendar,
  Clock,
  User as UserIcon,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';

export const Vitals: React.FC = () => {
  const { user } = useAuth();
  const { patients, vitals: allVitals, addVitals, updateVitals, deleteVitals } = useCaseRecords();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [editingVitalsId, setEditingVitalsId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (editingVitalsId) {
      updateVitals(editingVitalsId, {
        patientId: selectedPatientId,
        recordedBy: user?.id || '1',
        ...formData
      });
    } else {
      addVitals({
        patientId: selectedPatientId,
        recordedBy: user?.id || '1',
        ...formData
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
      });
      setSelectedPatientId('');
      setEditingVitalsId(null);
    }, 1500);
  };

  const getPatientVitals = (patientId: string) => {
    return allVitals.filter(v => v.patientId === patientId).sort((a, b) => 
      new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Vitals</h1>
          <p className="text-gray-500">Track and monitor patient vital signs.</p>
        </div>
        <button 
          onClick={() => {
            setEditingVitalsId(null);
            setFormData({
              temperature: '',
              bloodPressure: '',
              heartRate: '',
              respiratoryRate: '',
              oxygenSaturation: '',
              weight: '',
              height: ''
            });
            setSelectedPatientId('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          Record Vitals
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patient by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredPatients.map((patient) => {
            const patientVitals = getPatientVitals(patient.id);
            const latest = patientVitals[0];

            return (
              <div key={patient.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">ID: {patient.id} • {patient.gender} • {patient.bloodGroup}</p>
                    </div>
                  </div>

                  {latest ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 flex-1 max-w-4xl">
                      <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-red-500 mb-1">
                          <Thermometer size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Temp</span>
                        </div>
                        <p className="font-bold text-gray-900">{latest.temperature}°C</p>
                      </div>
                      <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                          <Droplet size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">BP</span>
                        </div>
                        <p className="font-bold text-gray-900">{latest.bloodPressure}</p>
                      </div>
                      <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-rose-500 mb-1">
                          <Heart size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Heart</span>
                        </div>
                        <p className="font-bold text-gray-900">{latest.heartRate} bpm</p>
                      </div>
                      <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-cyan-500 mb-1">
                          <Wind size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Resp</span>
                        </div>
                        <p className="font-bold text-gray-900">{latest.respiratoryRate}</p>
                      </div>
                      <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                          <Activity size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">SpO2</span>
                        </div>
                        <p className="font-bold text-gray-900">{latest.oxygenSaturation}%</p>
                      </div>
                      <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Calendar size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Last</span>
                        </div>
                        <p className="font-bold text-gray-900 text-xs">{latest.date}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-center py-4 text-gray-400 text-sm font-medium italic">
                      No vitals recorded yet.
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        const latest = getPatientVitals(patient.id)[0];
                        if (latest) {
                          setEditingVitalsId(latest.id);
                          setFormData({
                            temperature: latest.temperature,
                            bloodPressure: latest.bloodPressure,
                            heartRate: latest.heartRate,
                            respiratoryRate: latest.respiratoryRate,
                            oxygenSaturation: latest.oxygenSaturation,
                            weight: latest.weight || '',
                            height: latest.height || ''
                          });
                        } else {
                          setEditingVitalsId(null);
                          setFormData({
                            temperature: '',
                            bloodPressure: '',
                            heartRate: '',
                            respiratoryRate: '',
                            oxygenSaturation: '',
                            weight: '',
                            height: ''
                          });
                        }
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-all"
                    >
                      Update
                    </button>
                    {latest && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this vital record?')) {
                            deleteVitals(latest.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete latest record"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVitalsId ? "Edit Patient Vitals" : "Record Patient Vitals"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Patient</label>
            <select 
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">Choose a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Temperature (°C)</label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="text" 
                  placeholder="36.5"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Blood Pressure (mmHg)</label>
              <div className="relative">
                <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="text" 
                  placeholder="120/80"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Heart Rate (bpm)</label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="text" 
                  placeholder="72"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resp. Rate (bpm)</label>
              <div className="relative">
                <Wind className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="text" 
                  placeholder="16"
                  value={formData.respiratoryRate}
                  onChange={(e) => setFormData({...formData, respiratoryRate: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">SpO2 (%)</label>
              <input 
                required
                type="text" 
                placeholder="98"
                value={formData.oxygenSaturation}
                onChange={(e) => setFormData({...formData, oxygenSaturation: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Weight (kg)</label>
              <input 
                type="text" 
                placeholder="70"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Height (cm)</label>
              <input 
                type="text" 
                placeholder="175"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
              isSuccess ? 'bg-green-600 shadow-green-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
            }`}
          >
            {isSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={20} /> {editingVitalsId ? 'Vitals Updated!' : 'Vitals Recorded!'}
              </span>
            ) : (editingVitalsId ? 'Update Vitals' : 'Save Vitals')}
          </button>
        </form>
      </Modal>
    </div>
  );
};
