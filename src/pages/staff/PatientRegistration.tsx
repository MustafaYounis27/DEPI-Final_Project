
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Droplets,
  CreditCard,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { useAuth } from '../../context/AuthContext';

export const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addPatient } = useCaseRecords();

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    insuranceId: '',
    emergencyContact: '',
    allergies: '',
    chronicDiseases: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in required fields (Name and Phone)');
      return;
    }

    addPatient({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      chronicDiseases: formData.chronicDiseases,
      insuranceId: formData.insuranceId,
      emergencyContact: formData.emergencyContact,
    });

    alert('Patient registered successfully!');
    navigate('/staff');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Registration</h1>
        <p className="text-gray-500">Create a new patient record in the system.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <UserPlus size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Blood Group</label>
                <div className="relative">
                  <Droplets size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                  >
                    <option value="">Select Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
          
          {/* Medical Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <ShieldAlert size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Medical Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Allergies</label>
                <textarea 
                  rows={2} 
                  placeholder="List any allergies..." 
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 resize-none"
                ></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Chronic Diseases</label>
                <textarea 
                  rows={2} 
                  placeholder="List any chronic conditions..." 
                  value={formData.chronicDiseases}
                  onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 resize-none"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Phone size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Contact Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-bold text-gray-700">Home Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea 
                    rows={3} 
                    placeholder="Full address..." 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* Insurance & Emergency */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <ShieldAlert size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Insurance & Emergency</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Insurance ID</label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="INS-1234567" 
                    value={formData.insuranceId}
                    onChange={(e) => setFormData({ ...formData, insuranceId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Emergency Contact</label>
                <input 
                  type="text" 
                  placeholder="Name & Phone" 
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-50">
            <button 
              type="button"
              onClick={() => navigate('/staff')}
              className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              Save Patient
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
