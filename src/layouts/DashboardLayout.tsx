
import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Activity,
  ClipboardList, 
  Stethoscope, 
  FileText, 
  CreditCard, 
  ShieldCheck,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  // Global/Admin
  { label: 'Admin Dashboard', href: '/admin', icon: <LayoutDashboard size={20} />, roles: ['ADMIN'] },
  { label: 'Manage Users', href: '/admin/users', icon: <Users size={20} />, roles: ['ADMIN'] },
  { label: 'Audit Logs', href: '/admin/logs', icon: <ShieldCheck size={20} />, roles: ['ADMIN'] },
  
  // Doctor
  { label: 'Doctor Dashboard', href: '/doctor', icon: <LayoutDashboard size={20} />, roles: ['DOCTOR'] },
  { label: 'My Patients', href: '/doctor/patients', icon: <Stethoscope size={20} />, roles: ['DOCTOR'] },
  { label: 'Patient Vitals', href: '/doctor/vitals', icon: <Activity size={20} />, roles: ['DOCTOR'] },
  { label: 'Appointments', href: '/doctor/appointments', icon: <Calendar size={20} />, roles: ['DOCTOR'] },
  { label: 'Prescriptions', href: '/doctor/prescriptions', icon: <ClipboardList size={20} />, roles: ['DOCTOR'] },
  
  // Staff
  { label: 'Staff Dashboard', href: '/staff', icon: <LayoutDashboard size={20} />, roles: ['STAFF'] },
  { label: 'Patient Directory', href: '/staff/patients', icon: <Users size={20} />, roles: ['STAFF'] },
  { label: 'Patient Registration', href: '/staff/registration', icon: <ClipboardList size={20} />, roles: ['STAFF'] },
  { label: 'All Appointments', href: '/staff/appointments', icon: <Calendar size={20} />, roles: ['STAFF'] },
  { label: 'Billing & Invoices', href: '/staff/billing', icon: <CreditCard size={20} />, roles: ['STAFF'] },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredNavItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Stethoscope size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900">HealthCore</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-bottom border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {filteredNavItems.find(i => i.href === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
              </div>
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                alt={user?.name}
                className="w-10 h-10 rounded-full border border-gray-200"
              />
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 bg-gray-50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
