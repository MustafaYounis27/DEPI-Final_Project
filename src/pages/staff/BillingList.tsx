
import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Download,
  Filter,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { useCaseRecords } from '../../context/CaseRecordsContext';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../../components/Modal';
import { Billing } from '../../types';

export const BillingList: React.FC = () => {
  const { bills, patients, addBill, deleteBill, updateBill } = useCaseRecords();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Partial'>('All');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Create Invoice Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [items, setItems] = useState<{ description: string; cost: number }[]>([{ description: '', cost: 0 }]);
  const [status, setStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Unpaid');

  const filteredBills = bills.filter(bill => {
    const patient = patients.find(p => p.id === bill.patientId);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = {
    revenue: bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0),
    pending: bills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0),
    paidCount: bills.filter(b => b.status === 'Paid').length
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'description' | 'cost', value: string | number) => {
    const newItems = [...items];
    if (field === 'cost') {
      newItems[index][field] = Number(value);
    } else {
      newItems[index][field] = String(value);
    }
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const totalAmount = items.reduce((sum, item) => sum + item.cost, 0);
    addBill({
      patientId: selectedPatient,
      amount: totalAmount,
      status: status,
      items: items
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsCreateModalOpen(false);
      // Reset form
      setSelectedPatient('');
      setItems([{ description: '', cost: 0 }]);
      setStatus('Unpaid');
    }, 1500);
  };

  const handleDownload = (bill: Billing) => {
    // Simulate download
    const patient = patients.find(p => p.id === bill.patientId);
    const content = `
      Invoice #${bill.id}
      Patient: ${patient?.name}
      Date: ${bill.date}
      Status: ${bill.status}
      
      Items:
      ${bill.items.map(item => `${item.description}: $${item.cost}`).join('\n')}
      
      Total: $${bill.amount.toFixed(2)}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${bill.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-500">Manage patient invoices and payment tracking.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totals.revenue.toLocaleString()}`, change: 'Paid Invoices', icon: <DollarSign className="text-green-600" /> },
          { label: 'Pending Collections', value: `$${totals.pending.toLocaleString()}`, change: 'Outstanding Bills', icon: <Clock className="text-orange-600" /> },
          { label: 'Paid Invoices', value: totals.paidCount, change: 'This session', icon: <CheckCircle2 className="text-blue-600" /> },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-medium text-gray-400">{stat.label}</span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 rounded-full font-bold">{stat.change}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by invoice ID or patient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBills.map((bill, index) => {
                const patient = patients.find(p => p.id === bill.patientId);
                return (
                  <motion.tr 
                    key={bill.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-gray-400">#{bill.id.slice(-6)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                          {patient?.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{patient?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-500">{bill.date}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-gray-900">${bill.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => updateBill(bill.id, { status: bill.status === 'Paid' ? 'Unpaid' : 'Paid' })}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider transition-all ${
                        bill.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {bill.status === 'Paid' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {bill.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-right">
                        <button 
                          onClick={() => handleDownload(bill)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm('Delete this invoice?')) {
                              deleteBill(bill.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredBills.length === 0 && (
            <div className="p-12 text-center text-gray-500 font-medium">
              No invoices found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Invoice">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Select Patient</label>
            <select 
              required
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">Choose a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Billing Items</label>
              <button 
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-xs"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input 
                      required
                      type="text" 
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <input 
                      required
                      type="number" 
                      placeholder="Cost"
                      value={item.cost}
                      onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm"
                    />
                  </div>
                  {items.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">${items.reduce((sum, i) => sum + i.cost, 0).toFixed(2)}</p>
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
              isSuccess ? 'bg-green-600 shadow-green-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
            }`}
          >
            {isSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={20} /> Invoice Created!
              </span>
            ) : 'Generate Invoice'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
