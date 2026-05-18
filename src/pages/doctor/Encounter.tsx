import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, History, Activity, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function DoctorEncounter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('symptoms');
  
  // Form State
  const [symptoms, setSymptoms] = useState({ chiefComplaint: '', hpi: '' });
  const [vitals, setVitals] = useState({ systolic: '', diastolic: '', heartRate: '', temp: '', respRate: '' });
  const [diagnosis, setDiagnosis] = useState({ primary: '', secondary: '' });
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '' }]);

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedications(newMeds);
  };

  const handleCompleteEncounter = () => {
    // In a real app, you would save the data here
    alert('Encounter completed and saved successfully!');
    navigate('/doctor/queue');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Encounter</h1>
          <p className="text-sm text-slate-500 mt-1">In Progress: Arthur Miller</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/doctor/history')}
            variant="outline"
            leftIcon={<History size={16} />}
          >
            View History
          </Button>
          <Button 
            onClick={handleCompleteEncounter}
            leftIcon={<Save size={16} />}
          >
            Complete Encounter
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Panel: Patient Info (Fixed) */}
        <Card className="w-full lg:w-80 flex flex-col overflow-y-auto shrink-0 p-0">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur" alt="Arthur" className="w-12 h-12 rounded-full bg-slate-100" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Arthur Miller</h2>
                <p className="text-xs text-slate-500">Male, 45 yrs</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-xs mb-1">Blood Type</span>
                <span className="font-semibold text-slate-900">A+</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-xs mb-1">Weight</span>
                <span className="font-semibold text-slate-900">178 lbs</span>
              </div>
            </div>
          </div>

          <div className="p-5 border-b border-slate-200">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" />
              Allergies
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="warning">Penicillin</Badge>
              <Badge variant="warning">Peanuts</Badge>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              Recent Vitals
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">BP</span>
                <span className="font-medium text-slate-900">120/80 mmHg</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Heart Rate</span>
                <span className="font-medium text-slate-900">72 bpm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Temp</span>
                <span className="font-medium text-slate-900">98.6 °F</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Panel: Medical Input Form */}
        <Card className="flex-1 flex flex-col overflow-hidden min-h-[500px] p-0">
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
            {['symptoms', 'vitals', 'diagnosis', 'prescription', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 border-r border-l border-slate-200 -mb-px first:border-l-0' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-t-2 border-t-transparent border-r border-l border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'symptoms' && (
              <div className="space-y-6">
                <Input 
                  label="Chief Complaint"
                  type="text" 
                  value={symptoms.chiefComplaint}
                  onChange={(e) => setSymptoms({...symptoms, chiefComplaint: e.target.value})}
                  placeholder="e.g., Persistent cough" 
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">History of Present Illness (HPI)</label>
                  <textarea 
                    value={symptoms.hpi}
                    onChange={(e) => setSymptoms({...symptoms, hpi: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm bg-white" 
                    placeholder="Describe the onset, duration, and character of symptoms..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Blood Pressure (mmHg)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={vitals.systolic}
                      onChange={(e) => setVitals({...vitals, systolic: e.target.value})}
                      placeholder="Systolic" 
                    />
                    <span className="text-slate-400">/</span>
                    <Input 
                      type="number" 
                      value={vitals.diastolic}
                      onChange={(e) => setVitals({...vitals, diastolic: e.target.value})}
                      placeholder="Diastolic" 
                    />
                  </div>
                </div>
                <Input 
                  label="Heart Rate (bpm)"
                  type="number" 
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                  placeholder="e.g., 72" 
                />
                <Input 
                  label="Temperature (°F)"
                  type="number" 
                  step="0.1" 
                  value={vitals.temp}
                  onChange={(e) => setVitals({...vitals, temp: e.target.value})}
                  placeholder="e.g., 98.6" 
                />
                <Input 
                  label="Respiratory Rate"
                  type="number" 
                  value={vitals.respRate}
                  onChange={(e) => setVitals({...vitals, respRate: e.target.value})}
                  placeholder="e.g., 16" 
                />
              </div>
            )}

            {activeTab === 'diagnosis' && (
              <div className="space-y-6">
                <Input 
                  label="Primary Diagnosis (ICD-10)"
                  type="text" 
                  value={diagnosis.primary}
                  onChange={(e) => setDiagnosis({...diagnosis, primary: e.target.value})}
                  placeholder="Search diagnosis..." 
                />
                <Input 
                  label="Secondary Diagnoses"
                  type="text" 
                  value={diagnosis.secondary}
                  onChange={(e) => setDiagnosis({...diagnosis, secondary: e.target.value})}
                  placeholder="Add secondary diagnosis..." 
                />
              </div>
            )}

            {activeTab === 'prescription' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm">Current Medications</h4>
                    <p className="text-xs text-blue-700 mt-1">Patient is currently taking Lisinopril (10mg) and Atorvastatin (20mg). Be mindful of interactions.</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Add New Medication</label>
                  <div className="space-y-3">
                    {medications.map((med, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="flex-1 w-full">
                          <Input 
                            type="text" 
                            value={med.name}
                            onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                            placeholder="Medication name" 
                          />
                        </div>
                        <div className="w-full sm:w-32">
                          <Input 
                            type="text" 
                            value={med.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            placeholder="Dosage" 
                          />
                        </div>
                        <div className="w-full sm:w-40">
                          <Input 
                            type="text" 
                            value={med.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            placeholder="Frequency" 
                          />
                        </div>
                        {medications.length > 1 && (
                          <button 
                            onClick={() => handleRemoveMedication(index)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Remove medication"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleAddMedication}
                    className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
                  >
                    <Plus size={16} />
                    Add another medication
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Clinical Notes & Plan</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-full min-h-[300px] p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm bg-white" 
                    placeholder="Enter detailed clinical notes, treatment plan, and follow-up instructions..."
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
