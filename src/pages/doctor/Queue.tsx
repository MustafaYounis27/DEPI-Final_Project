import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, AlertCircle, CheckCircle2, Play, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function DoctorQueue() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const queue = [
    {
      id: 1,
      patientName: 'Sarah Jenkins',
      time: '09:15 AM',
      type: 'Follow-up',
      status: 'In Progress',
      waitTime: '0m',
      notes: 'Reviewing recent lab results',
      isUrgent: false
    },
    {
      id: 2,
      patientName: 'Robert Chen',
      time: '09:45 AM',
      type: 'Initial Consult',
      status: 'Waiting',
      waitTime: '15m',
      notes: 'New patient, referred by Dr. Smith',
      isUrgent: false
    },
    {
      id: 3,
      patientName: 'Maria Garcia',
      time: '10:10 AM',
      type: 'Lab Review',
      status: 'Waiting',
      waitTime: '5m',
      notes: 'Cholesterol panel review',
      isUrgent: false
    },
    {
      id: 4,
      patientName: 'Linda Thompson',
      time: '11:00 AM',
      type: 'Emergency',
      status: 'Queued',
      waitTime: '-',
      notes: 'Severe chest pain, triaged by ER',
      isUrgent: true
    },
    {
      id: 5,
      patientName: 'James Wilson',
      time: '10:30 AM',
      type: 'Routine Check',
      status: 'Completed',
      waitTime: '-',
      notes: 'Annual physical completed',
      isUrgent: false
    }
  ];

  const filteredQueue = queue.filter(q => 
    q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status: string, isUrgent: boolean) => {
    if (isUrgent) return 'danger';
    switch (status) {
      case 'In Progress': return 'success';
      case 'Waiting': return 'warning';
      case 'Completed': return 'default';
      default: return 'info';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your daily patient flow and live consultations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Input 
              type="text" 
              placeholder="Search patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="bg-white"
            />
          </div>
          <Button variant="outline" className="px-3">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Patient</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Time / Wait</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Visit Type</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Status</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.isUrgent ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.isUrgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {item.patientName}
                          {item.isUrgent && <AlertCircle size={14} className="text-red-500" />}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{item.notes}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{item.time}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      Wait: {item.waitTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{item.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(item.status, item.isUrgent) as any}>
                      {item.isUrgent ? 'URGENT' : item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status !== 'Completed' ? (
                      <Button 
                        onClick={() => navigate('/doctor/notes')}
                        variant="secondary"
                        size="sm"
                        leftIcon={<Play size={14} />}
                      >
                        {item.status === 'In Progress' ? 'Resume' : 'Start'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate('/doctor/notes')}
                        variant="outline"
                        size="sm"
                        leftIcon={<CheckCircle2 size={14} />}
                      >
                        Review
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
