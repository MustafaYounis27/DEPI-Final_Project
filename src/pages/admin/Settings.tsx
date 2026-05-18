import React, { useState } from 'react';
import { Building, Bell, Shield, Database, Save, Globe, Mail, Phone, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure global application settings and preferences.</p>
        </div>
        <Button leftIcon={<Save size={16} />}>
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <Card className="overflow-hidden p-0">
            <nav className="flex flex-col">
              <button 
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Building size={18} />
                General Details
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Shield size={18} />
                Security & Access
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell size={18} />
                Notifications
              </button>
              <button 
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'database' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Database size={18} />
                Data Management
              </button>
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <Card className="flex-1 p-6">
          {activeTab === 'general' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Hospital Information</h2>
              
              <div className="space-y-4">
                <Input 
                  label="Facility Name"
                  type="text" 
                  defaultValue="HealthCore Medical Center" 
                  leftIcon={<Building size={16} />}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Contact Email"
                    type="email" 
                    defaultValue="admin@healthcore.com" 
                    leftIcon={<Mail size={16} />}
                  />
                  <Input 
                    label="Phone Number"
                    type="tel" 
                    defaultValue="+1 (555) 123-4567" 
                    leftIcon={<Phone size={16} />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option>Pacific Time (PT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Central Time (CT)</option>
                      <option>Eastern Time (ET)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Security Policies</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-slate-500 mt-1">Require all staff to use 2FA for system access.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Session Timeout</h3>
                    <p className="text-xs text-slate-500 mt-1">Automatically log out inactive users.</p>
                  </div>
                  <select className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white w-32">
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                    <option>Never</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Password Expiry</h3>
                    <p className="text-xs text-slate-500 mt-1">Force users to change passwords periodically.</p>
                  </div>
                  <select className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white w-32">
                    <option>30 Days</option>
                    <option>60 Days</option>
                    <option>90 Days</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">System Notifications</h2>
              
              <div className="space-y-4">
                {[
                  { title: 'New Patient Registration', desc: 'Notify admins when a new patient registers.' },
                  { title: 'Appointment Cancellations', desc: 'Alert staff when an appointment is cancelled.' },
                  { title: 'System Errors', desc: 'Send alerts for critical system failures.' },
                  { title: 'Daily Summary Reports', desc: 'Email a daily summary of hospital activities.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                    <input type="checkbox" defaultChecked={i < 2} className="mt-1 w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500" />
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Data Management</h2>
              
              <div className="space-y-6">
                <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg flex items-start gap-4">
                  <Database className="text-blue-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">Automated Backups</h3>
                    <p className="text-xs text-blue-700 mt-1 mb-3">System is currently configured to backup all data daily at 02:00 AM.</p>
                    <Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                      Configure Schedule
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-2">Data Export</h3>
                  <p className="text-xs text-slate-500 mb-3">Download a complete archive of system data (requires admin re-authentication).</p>
                  <Button variant="primary" className="bg-slate-800 hover:bg-slate-900 text-white" leftIcon={<Lock size={14} />}>
                    Request Data Export
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
