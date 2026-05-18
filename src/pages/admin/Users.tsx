import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Shield, User, Mail, Activity } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const users = [
    { id: 'USR-001', name: 'Dr. Sarah Mitchell', role: 'Doctor', department: 'Cardiology', email: 's.mitchell@healthcore.com', status: 'Active' },
    { id: 'USR-002', name: 'Dr. James Wilson', role: 'Doctor', department: 'Neurology', email: 'j.wilson@healthcore.com', status: 'Active' },
    { id: 'USR-003', name: 'Emily Chen', role: 'Nurse', department: 'Emergency', email: 'e.chen@healthcore.com', status: 'Active' },
    { id: 'USR-004', name: 'Michael Brown', role: 'Admin', department: 'Operations', email: 'm.brown@healthcore.com', status: 'Active' },
    { id: 'USR-005', name: 'Jessica Taylor', role: 'Receptionist', department: 'Front Desk', email: 'j.taylor@healthcore.com', status: 'Inactive' },
    { id: 'USR-006', name: 'Dr. Robert Smith', role: 'Doctor', department: 'Pediatrics', email: 'r.smith@healthcore.com', status: 'Active' },
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleVariant = (role: string) => {
    switch(role) {
      case 'Doctor': return 'info';
      case 'Nurse': return 'success';
      case 'Admin': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage staff accounts, roles, and system access.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="bg-white"
            />
          </div>
          <Button variant="outline" className="px-3">
            <Filter size={18} />
          </Button>
          <Button 
            onClick={() => setActiveModal('new-user')}
            leftIcon={<Plus size={16} />}
            className="whitespace-nowrap"
          >
            Add User
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">User</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Role & Dept</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Contact</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200">Status</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase tracking-wider bg-slate-50 font-medium border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={getRoleVariant(user.role) as any}>
                        {user.role}
                      </Badge>
                      <span className="text-sm text-slate-600">{user.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" title="Edit User">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500" title="Permissions">
                        <Shield size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" title="Deactivate">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={activeModal === 'new-user'} onClose={() => setActiveModal(null)} title="Add New User">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" type="text" placeholder="e.g. Jane" required />
            <Input label="Last Name" type="text" placeholder="e.g. Doe" required />
          </div>
          <Input label="Email Address" type="email" placeholder="jane.doe@healthcore.com" required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="">Select role...</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <select required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="">Select department...</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Emergency">Emergency</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full mt-2">
            Create User Account
          </Button>
        </form>
      </Modal>
    </div>
  );
}
