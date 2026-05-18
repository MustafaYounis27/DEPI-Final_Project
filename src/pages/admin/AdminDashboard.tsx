
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Server,
  Database as DatabaseIcon,
  Globe
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { useCaseRecords } from '../../context/CaseRecordsContext';
import { api } from '../../lib/api';

export const AdminDashboard: React.FC = () => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const { bills } = useCaseRecords();
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [systemHealth, setSystemHealth] = useState({
    api: 'Unknown',
    db: 'Unknown',
    auth: 'Operational'
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, logsRes] = await Promise.all([
          api.get('/users'),
          api.get('/auditlogs')
        ]);
        setUsers(usersRes.data);
        setAuditLogs(logsRes.data);
      } catch (e) {
        console.error('Failed to fetch admin data', e);
      }
    };
    fetchAdminData();
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const start = Date.now();
      await api.get('/users');
      const time = Date.now() - start;
      
      setSystemHealth({
        api: time < 1000 ? 'Operational' : 'Degraded',
        db: 'Operational',
        auth: 'Operational'
      });
      setLastUpdated(new Date());
    } catch (e) {
      setSystemHealth({
        api: 'Down',
        db: 'Down',
        auth: 'Degraded'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isStatusModalOpen && !lastUpdated) {
      handleRefreshStatus();
    }
  }, [isStatusModalOpen]);

  const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0);
  const activeDoctors = users.filter(u => u.role === 1 || u.role === 'Doctor').length;
  const totalStaff = users.filter(u => u.role === 2 || u.role === 'Staff').length;

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(dateStr => {
    const dayBills = bills.filter(b => b.date && b.date.startsWith(dateStr));
    const revenue = dayBills.reduce((sum, b) => sum + b.amount, 0);
    return {
      name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue
    };
  });

  const alerts = auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5).map(log => {
    let type = 'success';
    if (log.action.includes('Error') || log.action.includes('Failed')) type = 'error';
    else if (log.action.includes('Update') || log.action.includes('Scheduled')) type = 'info';
    else if (log.action.includes('Delayed') || log.action.includes('Warning')) type = 'warning';
    return {
      type,
      msg: log.details || log.action,
      time: new Date(log.timestamp).toLocaleDateString() + ' ' + new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const newAlertsCount = auditLogs.filter(log => log.timestamp.startsWith(todayStr)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-500">Monitor overall hospital performance and system integrity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: 'Overall', trend: 'up', icon: <DollarSign className="text-green-600" /> },
          { label: 'Active Doctors', value: activeDoctors.toString(), change: 'Registered', trend: 'up', icon: <Stethoscope className="text-blue-600" /> },
          { label: 'Total staff', value: totalStaff.toString(), change: 'Registered', trend: 'neutral', icon: <Users className="text-purple-600" /> },
          { label: 'System Health', value: '99.9%', change: 'Stable', trend: 'up', icon: <ShieldCheck className="text-indigo-600" /> },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-400'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : stat.trend === 'down' ? <ArrowDownRight size={14} /> : null}
                {stat.change}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Revenue & Trends</h2>
            <select className="text-xs font-bold border-none bg-gray-50 rounded-lg px-3 py-1 cursor-pointer outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Logs / Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">System Alerts</h2>
            {newAlertsCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-lg">{newAlertsCount} NEW TODAY</span>
            )}
          </div>
          <div className="flex-1 space-y-4">
            {alerts.length > 0 ? alerts.map((alert, i) => (
              <div key={i} className="flex gap-3">
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  alert.type === 'warning' ? 'bg-orange-50 text-orange-500' :
                  alert.type === 'error' ? 'bg-red-50 text-red-500' :
                  alert.type === 'info' ? 'bg-blue-50 text-blue-500' :
                  'bg-green-50 text-green-500'
                }`}>
                  {alert.type === 'warning' && <AlertTriangle size={14} />}
                  {alert.type === 'error' && <AlertTriangle size={14} />}
                  {alert.type === 'info' && <Activity size={14} />}
                  {alert.type === 'success' && <ShieldCheck size={14} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{alert.msg}</p>
                  <p className="text-xs text-gray-400 font-medium">{alert.time}</p>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-gray-500 text-sm">No recent alerts</div>
            )}
          </div>
          <button 
            onClick={() => setIsStatusModalOpen(true)}
            className="mt-8 w-full py-3 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all rounded-2xl text-sm font-bold border border-gray-100"
          >
            View System Status
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Live System Status</h3>
                <button 
                  onClick={() => setIsStatusModalOpen(false)}
                  className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Globe size={18} /></div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Main API Server</p>
                      <p className="text-xs text-gray-500">us-east-1</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    systemHealth.api === 'Operational' ? 'bg-green-100 text-green-700' : 
                    systemHealth.api === 'Degraded' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {systemHealth.api}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><DatabaseIcon size={18} /></div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Primary Database</p>
                      <p className="text-xs text-gray-500">SQL Server (EF Core)</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    systemHealth.db === 'Operational' ? 'bg-green-100 text-green-700' : 
                    systemHealth.db === 'Degraded' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {systemHealth.db}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Server size={18} /></div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Auth Service</p>
                      <p className="text-xs text-gray-500">Firebase Auth</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    systemHealth.auth === 'Operational' ? 'bg-green-100 text-green-700' : 
                    systemHealth.auth === 'Degraded' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {systemHealth.auth}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</span>
                <button 
                  onClick={handleRefreshStatus}
                  disabled={isRefreshing}
                  className={`font-bold text-indigo-600 hover:text-indigo-700 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
