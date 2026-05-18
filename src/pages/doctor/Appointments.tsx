import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus, Search, Bell } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function DoctorAppointments() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<'day' | 'week' | 'month' | 'list'>('day');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Reminder states
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [reminderMethod, setReminderMethod] = useState<'Email' | 'SMS' | 'Both'>('Both');
  const [reminderTiming, setReminderTiming] = useState<string>('24h');
  const [reminderSent, setReminderSent] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setTimeout(() => {
      setReminderSent(false);
      setReminderMethod('Both');
      setReminderTiming('24h');
    }, 300);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (dayStr: string) => {
    // Generate new Date based on clicked day
    // assuming it comes as YYYY-MM-DD for simplicity
    setSelectedDate(new Date(dayStr));
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Next month padding to fill out 42 slots (6 weeks) -> or just up to last week
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
       days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();
  const todayStr = new Date().toDateString();
  const selectedStr = selectedDate.toDateString();

  const getAppointmentsForDate = (date: Date) => {
    const isToday = date.toDateString() === new Date().toDateString();
    
    // Base appointments that show up for today
    const baseAppointments = [
      {
        id: 1,
        patient: 'Sarah Jenkins',
        type: 'Follow-up',
        time: '09:15 AM - 09:45 AM',
        status: 'Confirmed'
      },
      {
        id: 2,
        patient: 'Robert Chen',
        type: 'Initial Consult',
        time: '09:45 AM - 10:15 AM',
        status: 'Confirmed'
      },
      {
        id: 4,
        patient: 'James Wilson',
        type: 'Routine Check',
        time: '10:30 AM - 11:00 AM',
        status: 'Confirmed'
      },
      {
        id: 5,
        patient: 'Linda Thompson',
        type: 'Emergency',
        time: '11:00 AM - 11:45 AM',
        status: 'Urgent'
      }
    ];

    let result = [];

    if (isToday) {
      result = baseAppointments;
    } else {
      // Deterministic mock generation based on date
      const seed = date.getDate();
      if (seed % 3 === 0) {
        result = baseAppointments.slice(0, 2);
      } else if (seed % 2 === 0) {
        result = [baseAppointments[3]];
      }
    }
    
    return result.filter(apt => {
      const matchesSearch = apt.patient.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === '' || apt.type === filterType;
      return matchesSearch && matchesType;
    });
  };

  const appointments = getAppointmentsForDate(selectedDate);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Urgent': return 'danger';
      default: return 'default';
    }
  };

  const renderDayView = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center h-40">
          <CalendarIcon className="text-slate-300 w-12 h-12 mb-3" />
          <h4 className="font-medium text-slate-800">No appointments</h4>
          <p className="text-sm text-slate-500">You have a clear schedule for this day.</p>
        </div>
      ) : (
        appointments.map((apt) => (
          <div key={apt.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
            <div className="w-32 shrink-0 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4">
              <span className="text-sm font-bold text-slate-900">{apt.time.split(' - ')[0]}</span>
              <span className="text-xs text-slate-500">{apt.time.split(' - ')[1]}</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{apt.patient}</h4>
                <Badge variant={getStatusVariant(apt.status) as any} className="text-[10px] uppercase tracking-wider">
                  {apt.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><User size={14} /> {apt.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <Button 
                onClick={() => {
                  setSelectedAppointmentId(apt.id);
                  setActiveModal('reminder');
                }}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Bell size={14} className="mr-1.5" />
                Remind
              </Button>
              <Button 
                onClick={() => setActiveModal('reschedule')}
                variant="outline"
                size="sm"
              >
                Reschedule
              </Button>
              <Button variant="secondary" size="sm">
                Details
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderWeekView = () => {
    // Find start of week (Sunday)
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const weekDays = Array.from({length: 7}).map((_, i) => {
       const d = new Date(startOfWeek);
       d.setDate(startOfWeek.getDate() + i);
       return d;
    });

    return (
      <div className="flex-1 p-4 flex gap-4 overflow-x-auto bg-slate-50/50">
        {weekDays.map(day => {
          const dayAppointments = getAppointmentsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className="flex-1 min-w-[220px] flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
               <div className={`p-3 border-b text-center ${isToday ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                 <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{day.toLocaleDateString('default', { weekday: 'short' })}</div>
                 <div className={`text-lg font-bold ${isToday ? 'text-blue-700' : 'text-slate-900'}`}>{day.getDate()}</div>
               </div>
               <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                 {dayAppointments.length > 0 ? dayAppointments.map(apt => (
                   <div key={apt.id} className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all">
                     <div className="flex items-center justify-between mb-1">
                       <div className="font-semibold text-slate-800 text-sm">{apt.time.split(' - ')[0]}</div>
                       <Badge variant={getStatusVariant(apt.status) as any} className="text-[9px] px-1.5 py-0">
                         {apt.status === 'Confirmed' ? 'Conf' : apt.status}
                       </Badge>
                     </div>
                     <div className="text-slate-700 text-sm font-medium truncate">{apt.patient}</div>
                     <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><User size={12}/> {apt.type}</div>
                   </div>
                 )) : (
                   <div className="text-center text-xs text-slate-400 py-6 italic">No appointments</div>
                 )}
               </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
         <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-slate-500 bg-slate-200 border-b border-slate-200 shrink-0">
           {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
             <div key={d} className="bg-slate-50 p-2.5 uppercase tracking-wider">{d}</div>
           ))}
         </div>
         <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1 overflow-y-auto">
           {calendarDays.map((calDay, idx) => {
             const dayAppointments = getAppointmentsForDate(calDay.date);
             const isCurrentMonth = calDay.isCurrentMonth;
             const isToday = calDay.date.toDateString() === new Date().toDateString();
             
             return (
               <div 
                 key={idx} 
                 onClick={() => { 
                   setSelectedDate(calDay.date);
                   setCurrentMonth(new Date(calDay.date.getFullYear(), calDay.date.getMonth(), 1));
                   setViewType('day'); 
                 }} 
                 className={`bg-white p-2 min-h-[100px] cursor-pointer hover:bg-slate-50 transition-colors flex flex-col ${!isCurrentMonth ? 'opacity-50' : ''}`}
               >
                 <div className="flex justify-between items-start mb-1 shrink-0">
                   <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700'}`}>
                     {calDay.date.getDate()}
                   </div>
                   {dayAppointments.length > 0 && <span className="text-[10px] text-slate-400 font-medium">{dayAppointments.length} apts</span>}
                 </div>
                 
                 <div className="flex-1 space-y-1 overflow-hidden mask-fade-bottom">
                   {dayAppointments.slice(0, 3).map(apt => (
                     <div key={apt.id} className="text-[10.5px] px-1.5 py-1 rounded bg-blue-50/80 text-blue-800 truncate border border-blue-100/50 hover:bg-blue-100 relative">
                       <span className="font-semibold mr-1">{apt.time.split(':')[0]}:{apt.time.split(':')[1].split(' ')[0]}</span> 
                       {apt.patient}
                     </div>
                   ))}
                   {dayAppointments.length > 3 && (
                     <div className="text-[10px] text-slate-500 font-medium px-1 bg-slate-50 rounded py-0.5 mt-0.5">
                       + {dayAppointments.length - 3} more
                     </div>
                   )}
                 </div>
               </div>
             )
           })}
         </div>
      </div>
    );
  };

  const renderListView = () => {
    let start = dateRange.start ? new Date(dateRange.start) : new Date();
    start.setHours(12, 0, 0, 0); 
    let end = dateRange.end ? new Date(dateRange.end) : new Date(start);
    if (!dateRange.end) {
      end.setDate(start.getDate() + 14); // 2 weeks default
    }
    end.setHours(12, 0, 0, 0);

    const days = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (days.length > 60) break; // limit to 60 days
    }

    const allApts = days.map(day => {
      const apts = getAppointmentsForDate(day);
      return { day, apts };
    }).filter(item => item.apts.length > 0);

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
        {allApts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-40">
            <Search className="text-slate-300 w-12 h-12 mb-3" />
            <h4 className="font-medium text-slate-800">No matching appointments</h4>
            <p className="text-sm text-slate-500">Try adjusting your filters.</p>
          </div>
        ) : (
          allApts.map(({day, apts}) => (
             <div key={day.toISOString()} className="space-y-3">
               <h4 className="font-semibold text-slate-700 border-b pb-2 mb-3 flex items-center gap-2">
                 <CalendarIcon size={16} className="text-slate-400" />
                 {day.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
               </h4>
               {apts.map(apt => (
                  <div key={apt.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group">
                    <div className="w-32 shrink-0 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4">
                      <span className="text-sm font-bold text-slate-900">{apt.time.split(' - ')[0]}</span>
                      <span className="text-xs text-slate-500">{apt.time.split(' - ')[1]}</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{apt.patient}</h4>
                        <Badge variant={getStatusVariant(apt.status) as any} className="text-[10px] uppercase tracking-wider">
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User size={14} /> {apt.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Button 
                        onClick={() => {
                          setSelectedAppointmentId(apt.id);
                          setActiveModal('reminder');
                        }}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Bell size={14} className="mr-1.5" />
                        Remind
                      </Button>
                      <Button 
                        onClick={() => setActiveModal('reschedule')}
                        variant="outline"
                        size="sm"
                      >
                        Reschedule
                      </Button>
                      <Button variant="secondary" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
               ))}
             </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule & Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your calendar and upcoming patient visits.</p>
        </div>
        <Button 
          onClick={() => setActiveModal('new')}
          leftIcon={<Plus size={16} />}
        >
          New Appointment
        </Button>
      </div>

      <Card className="mb-6 p-4 shrink-0 shadow-sm border-slate-200">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
          <div className="flex-1">
            <Input 
              label="Search Patient" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="w-full xl:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Visit Type</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
            >
              <option value="">All Types</option>
              <option value="Initial Consult">Initial Consult</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Routine Check">Routine Check</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full xl:w-[320px]">
            <Input 
              label="Start Date" 
              type="date" 
              value={dateRange.start}
              onChange={(e) => {
                setDateRange({ ...dateRange, start: e.target.value });
                if (viewType !== 'list') setViewType('list');
              }}
            />
            <Input 
              label="End Date" 
              type="date" 
              value={dateRange.end}
              onChange={(e) => {
                setDateRange({ ...dateRange, end: e.target.value });
                if (viewType !== 'list') setViewType('list');
              }}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Calendar Sidebar */}
        <Card className="p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <button 
                onClick={prevMonth}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {calendarDays.map((calDay, idx) => {
              const isSelected = calDay.date.toDateString() === selectedStr;
              const isToday = calDay.date.toDateString() === todayStr;
              const isCurrentMonth = calDay.isCurrentMonth;
              
              let baseClasses = "p-2 rounded cursor-pointer transition-colors relative flex items-center justify-center ";
              
              if (!isCurrentMonth) {
                baseClasses += "text-slate-300 hover:text-slate-500 ";
              } else if (isSelected) {
                baseClasses += "bg-blue-600 text-white font-semibold shadow-sm ";
              } else {
                baseClasses += "text-slate-700 hover:bg-slate-50 ";
                if (isToday) {
                  baseClasses += "ring-1 ring-inset ring-blue-600/30 text-blue-700 font-medium ";
                }
              }

              return (
                 <div 
                   key={idx} 
                   onClick={() => handleDateClick(calDay.date.toISOString())}
                   className={baseClasses}
                 >
                   <span>{calDay.date.getDate()}</span>
                 </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Today's Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Total Appointments</span>
                <span className="font-semibold text-slate-900">{appointments.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Completed</span>
                <span className="font-semibold text-emerald-600">
                  {appointments.filter(a => a.status === 'Confirmed').length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Remaining</span>
                <span className="font-semibold text-blue-600">
                  {appointments.filter(a => a.status !== 'Confirmed').length}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Display Area */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-slate-900">
              {viewType === 'day' && selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
              {viewType === 'week' && `Week of ${(() => {
                const start = new Date(selectedDate);
                start.setDate(selectedDate.getDate() - selectedDate.getDay());
                return start.toLocaleDateString('default', { month: 'short', day: 'numeric' });
              })()}`}
              {viewType === 'month' && currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              {viewType === 'list' && "Search Results"}
            </h3>
            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
              {[
                { id: 'day', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
                { id: 'list', label: 'List' }
              ].map(v => (
                <button 
                  key={v.id}
                  onClick={() => setViewType(v.id as any)}
                  className={`px-3 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    viewType === v.id 
                      ? 'bg-slate-100 text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          
          {viewType === 'day' && renderDayView()}
          {viewType === 'week' && renderWeekView()}
          {viewType === 'month' && renderMonthView()}
          {viewType === 'list' && renderListView()}
        </Card>
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'new'} onClose={closeModal} title="Schedule New Appointment">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
          <Input label="Patient Name" type="text" placeholder="Search patient..." required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" required />
            <Input label="Time" type="time" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Visit Type</label>
            <select required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Select type...</option>
              <option value="Initial Consult">Initial Consult</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Routine Check">Routine Check</option>
            </select>
          </div>
          <Button type="submit" className="w-full mt-2">
            Schedule Appointment
          </Button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'reschedule'} onClose={closeModal} title="Reschedule Appointment">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
          <p className="text-sm text-slate-600 mb-2">Select a new time slot for this appointment.</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="New Date" type="date" required />
            <Input label="New Time" type="time" required />
          </div>
          <Button type="submit" className="w-full mt-2">
            Confirm Reschedule
          </Button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'reminder'} onClose={closeModal} title="Send Reminder">
        <div className="space-y-6">
          {reminderSent ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Reminder Sent!</h4>
              <p className="text-slate-500 mt-1 max-w-sm">The patient will receive their notification shortly via your selected method.</p>
              <Button onClick={closeModal} className="mt-6" variant="outline">Close</Button>
            </div>
          ) : (
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              setReminderSent(true); 
            }} className="space-y-4">
              <p className="text-sm text-slate-600">Configure how and when the patient should receive their notification.</p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notification Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Email', 'SMS', 'Both'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setReminderMethod(method as any)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                        reminderMethod === method 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 select-none'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Timing</label>
                <select 
                  value={reminderTiming}
                  onChange={(e) => setReminderTiming(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="1h">1 hour before</option>
                  <option value="2h">2 hours before</option>
                  <option value="24h">24 hours before</option>
                  <option value="48h">48 hours before</option>
                  <option value="custom">Custom schedule...</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600">
                Patient will receive {reminderMethod === 'Both' ? 'an Email and SMS' : `an ${reminderMethod}`} reminder <strong>{
                  reminderTiming === '1h' ? '1 hour' : 
                  reminderTiming === '2h' ? '2 hours' : 
                  reminderTiming === '24h' ? '24 hours' : 
                  reminderTiming === '48h' ? '48 hours' : 'at a custom time'
                }</strong> before their scheduled visit.
              </div>

              <Button type="submit" className="w-full mt-4" leftIcon={<Bell size={16} />}>
                Schedule Reminder
              </Button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
