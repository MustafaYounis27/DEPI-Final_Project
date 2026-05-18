import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus, MapPin, Search, Filter } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function AdminSchedules() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const shifts = [
    { id: 1, name: 'Dr. Sarah Mitchell', role: 'Cardiology', time: '08:00 AM - 04:00 PM', location: 'Wing A, Clinic 1', type: 'Regular' },
    { id: 2, name: 'Dr. James Wilson', role: 'Neurology', time: '09:00 AM - 05:00 PM', location: 'Wing B, Clinic 3', type: 'Regular' },
    { id: 3, name: 'Emily Chen', role: 'ER Nurse', time: '07:00 AM - 07:00 PM', location: 'Emergency Dept', type: '12h Shift' },
    { id: 4, name: 'Dr. Robert Smith', role: 'Pediatrics', time: '12:00 PM - 08:00 PM', location: 'Wing C, Clinic 2', type: 'Late Shift' },
    { id: 5, name: 'Jessica Taylor', role: 'Reception', time: '08:00 AM - 04:00 PM', location: 'Main Lobby', type: 'Regular' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Schedules</h1>
          <p className="text-sm text-slate-500 mt-1">Manage shifts, on-call rosters, and department coverage.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-800 rounded">Day</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">Week</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">Month</button>
          </div>
          <Button 
            onClick={() => setActiveModal('new-shift')}
            leftIcon={<Plus size={16} />}
            className="whitespace-nowrap"
          >
            Add Shift
          </Button>
        </div>
      </div>

      <Card className="flex flex-col min-h-[500px] p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"><ChevronLeft size={20} /></button>
              <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"><ChevronRight size={20} /></button>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Tuesday, October 14, 2023</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Input 
                type="text" 
                placeholder="Search staff or dept..." 
                leftIcon={<Search size={16} />}
                className="bg-white"
              />
            </div>
            <Button variant="outline" className="px-3">
              <Filter size={18} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200 w-1/4">Staff Member</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200 w-1/4">Shift Time</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200 w-1/4">Location</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{shift.name}</div>
                        <div className="text-xs text-slate-500">{shift.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-900 font-medium">
                      <Clock size={16} className="text-slate-400" />
                      {shift.time}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 ml-6">{shift.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <MapPin size={16} className="text-slate-400" />
                      {shift.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="success">
                      Scheduled
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={activeModal === 'new-shift'} onClose={() => setActiveModal(null)} title="Assign New Shift">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Staff Member</label>
            <select required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Select staff member...</option>
              <option value="1">Dr. Sarah Mitchell</option>
              <option value="2">Dr. James Wilson</option>
              <option value="3">Emily Chen</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift Type</label>
              <select required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="">Select type...</option>
                <option value="regular">Regular (8h)</option>
                <option value="extended">Extended (12h)</option>
                <option value="oncall">On-Call</option>
                <option value="night">Night Shift</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" required />
            <Input label="End Time" type="time" required />
          </div>
          <Input label="Location / Department" type="text" placeholder="e.g. Wing A, Clinic 1" required />
          <Button type="submit" className="w-full mt-2">
            Assign Shift
          </Button>
        </form>
      </Modal>
    </div>
  );
}
