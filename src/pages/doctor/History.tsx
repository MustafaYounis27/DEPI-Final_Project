import React, { useState } from 'react';
import { Search, Filter, FileText, Activity, User, Calendar, Download, Eye, ChevronRight } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function DoctorHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPatient(null);
  };

  const patients = [
    {
      id: 'PT-8472',
      name: 'Arthur Miller',
      age: 68,
      gender: 'Male',
      lastVisit: 'Oct 12, 2023',
      condition: 'Hypertension',
      records: 14
    },
    {
      id: 'PT-9211',
      name: 'Sarah Jenkins',
      age: 45,
      gender: 'Female',
      lastVisit: 'Oct 14, 2023',
      condition: 'Type 2 Diabetes',
      records: 8
    },
    {
      id: 'PT-3349',
      name: 'Robert Chen',
      age: 52,
      gender: 'Male',
      lastVisit: 'Sep 28, 2023',
      condition: 'Hyperlipidemia',
      records: 5
    },
    {
      id: 'PT-1028',
      name: 'Maria Garcia',
      age: 34,
      gender: 'Female',
      lastVisit: 'Oct 05, 2023',
      condition: 'Asthma',
      records: 11
    }
  ];

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPatientDetails = (patient: any) => {
    setSelectedPatient(patient);
    setActiveModal('details');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medical History Database</h1>
          <p className="text-sm text-slate-500 mt-1">Search and review patient medical records, labs, and past visits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Input 
              type="text" 
              placeholder="Search by patient name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="bg-white"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={18} />
            <span className="text-sm font-medium hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Patient ID / Name</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Demographics</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Primary Condition</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Last Visit</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openPatientDetails(patient)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{patient.age} yrs • {patient.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info">
                      {patient.condition}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {patient.lastVisit}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Details Modal */}
      <Modal isOpen={activeModal === 'details'} onClose={closeModal} title="Patient Overview">
        {selectedPatient && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 text-xl font-bold">
                {selectedPatient.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{selectedPatient.id}</span>
                  <span>{selectedPatient.age} years old</span>
                  <span>{selectedPatient.gender}</span>
                </div>
                <div className="mt-2">
                  <Badge variant="info">
                    {selectedPatient.condition}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="w-full"
                leftIcon={<FileText size={16} />}
              >
                View Full Chart
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                leftIcon={<Activity size={16} />}
              >
                Latest Vitals
              </Button>
            </div>

            {/* Recent Records */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center justify-between">
                Recent Records ({selectedPatient.records} total)
                <button className="text-blue-600 text-xs font-medium hover:underline">View All</button>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                      <FileText size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Clinical Note - Follow-up</p>
                      <p className="text-xs text-slate-500">{selectedPatient.lastVisit}</p>
                    </div>
                  </div>
                  <Eye size={16} className="text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Activity size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Comprehensive Metabolic Panel</p>
                      <p className="text-xs text-slate-500">Sep 15, 2023</p>
                    </div>
                  </div>
                  <Eye size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
