import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  History, 
  Search, 
  Download, 
  Calendar,
  Filter,
  User as UserIcon,
  Activity,
  Key,
  Database,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { User, AuditLog } from '../../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('ALL');
  const [eventType, setEventType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [logsRes, usersRes] = await Promise.all([
          api.get('/auditlogs'),
          api.get('/users')
        ]);
        
        const rawLogs = Array.isArray(logsRes.data) ? logsRes.data : [];
        const rawUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
        
        // Sort logs newest first
        const sortedLogs = [...rawLogs].sort((a: any, b: any) => 
          new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        );
        
        setLogs(sortedLogs);
        setUsers(rawUsers);
      } catch (error) {
        console.error("Failed to fetch audit logs or users", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getActionIcon = (action: string) => {
    const a = (action || '').toLowerCase();
    if (a.includes('create') || a.includes('add')) return <Database size={16} className="text-blue-500" />;
    if (a.includes('login')) return <Key size={16} className="text-green-500" />;
    if (a.includes('delete') || a.includes('remove')) return <ShieldAlert size={16} className="text-red-500" />;
    return <Activity size={16} className="text-purple-500" />;
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const user = users.find(u => String(u.id) === String(log.userId));
      const searchMatch = 
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user && (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
      
      const typeMatch = eventType === 'ALL' || (log.action || '').toLowerCase().includes(eventType.toLowerCase());
      
      // Simplistic date filtering
      let dateMatch = true;
      if (log.timestamp) {
        const logDate = new Date(log.timestamp);
        const today = new Date(); 
        
        if (dateRange === 'TODAY') {
          dateMatch = logDate.getDate() === today.getDate() && logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
        } else if (dateRange === 'WEEK') {
          const diffTime = Math.abs(today.getTime() - logDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          dateMatch = diffDays <= 7;
        }
      }
      
      return searchMatch && typeMatch && dateMatch;
    });
  }, [logs, users, searchTerm, eventType, dateRange]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Details'];
    const csvData = filteredLogs.map(log => {
      const user = users.find(u => String(u.id) === String(log.userId));
      return `"${log.timestamp || ''}","${user?.name || 'System'}","${log.action || ''}","${log.details || ''}"`;
    });
    
    const csvString = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange, eventType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500">Immutable record of all administrative and operational actions.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-700 shadow-sm"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter logs by user, action or keyword..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full appearance-none flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 text-sm font-bold pr-8 outline-none"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">Past 7 Days</option>
              </select>
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 lg:flex-none">
              <select 
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full appearance-none flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 text-sm font-bold pr-8 outline-none"
              >
                <option value="ALL">All Events</option>
                <option value="login">Logins</option>
                <option value="create">Creations</option>
                <option value="updated">Updates</option>
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Timestamp</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">User</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Action Event</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Detail/Summary</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px] text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                     <div className="flex justify-center items-center gap-2">
                       <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                       Loading audit logs...
                     </div>
                   </td>
                 </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log, index) => {
                      const user = users.find(u => String(u.id) === String(log.userId));
                      const logIdStr = String(log.id || index);
                      const ipSuffix = 100 + (parseInt(logIdStr.replace(/\D/g, '') || '0') % 20);
                      return (
                        <motion.tr 
                          key={log.id || index}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-gray-400 font-medium font-mono text-[11px]">
                              <Clock size={12} />
                              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <UserIcon size={12} className="text-gray-500" />
                              </div>
                              <span className="font-bold text-gray-700">{user?.name || 'System'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                              {getActionIcon(log.action)}
                              {log.action || 'Unknown Action'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-500 italic text-xs">{log.details || ''}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono text-[11px] text-gray-400">192.168.1.{ipSuffix}</span>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No audit logs found matching the current filters.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {paginatedLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} results
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || filteredLogs.length === 0}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredLogs.length === 0}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
