import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  HelpCircle,
  Activity,
  ClipboardList,
  Stethoscope
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface SidebarProps {
  role: 'doctor' | 'admin';
}

export function Sidebar({ role }: SidebarProps) {
  const navigate = useNavigate();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const links = {
    doctor: [
      { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
      { name: 'Patient Queue', path: '/doctor/queue', icon: Users },
      { name: 'Clinical Notes', path: '/doctor/notes', icon: ClipboardList },
      { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
      { name: 'Medical History', path: '/doctor/history', icon: FileText },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Schedules', path: '/admin/schedules', icon: Calendar },
      { name: 'System Settings', path: '/admin/settings', icon: Settings },
    ]
  };

  const currentLinks = links[role];

  return (
    <>
      <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0" aria-label="Sidebar Navigation">
        <div className="p-6 flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm">
            <Stethoscope size={20} />
          </div>
          <h1 className="font-bold text-xl text-slate-900 tracking-tight">HealthCore</h1>
        </div>

        <div className="px-4 mb-3 flex-1 overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3 px-4">Main Menu</div>
          <nav className="space-y-1" aria-label="Main Navigation">
            {currentLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === `/${role}`}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-600/20" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <link.icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                    {link.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-6 pt-4 border-t border-slate-100">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3 px-4">System</div>
          <div className="space-y-1">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full transition-colors"
            >
              <HelpCircle size={18} className="text-slate-400" />
              Support
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full transition-colors font-medium"
            >
              <LogOut size={18} className="text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <Modal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="HealthCore Support">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsSupportOpen(false); }}>
          <p className="text-sm text-slate-600">How can we help you today?</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Type</label>
            <select className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option>Technical Issue</option>
              <option>Billing Question</option>
              <option>Account Management</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea 
              required
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32" 
              placeholder="Describe your issue in detail..."
            />
          </div>
          <Button type="submit" className="w-full">
            Submit Ticket
          </Button>
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">Or call us at <strong className="text-slate-700">1-800-HEALTH-CORE</strong></p>
          </div>
        </form>
      </Modal>
    </>
  );
}
