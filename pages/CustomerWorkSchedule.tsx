
import React from 'react';
import { AppState } from '../types';
import { CalendarDays, Clock, User, HardHat, ChevronRight, ChevronLeft, Plus } from 'lucide-react';

interface CustomerWorkSchedulePageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const CustomerWorkSchedulePage: React.FC<CustomerWorkSchedulePageProps> = ({ state }) => {
  const days = [
    { key: 'Monday', label: 'الاثنين' },
    { key: 'Tuesday', label: 'الثلاثاء' },
    { key: 'Wednesday', label: 'الأربعاء' },
    { key: 'Thursday', label: 'الخميس' },
    { key: 'Friday', label: 'الجمعة' },
    { key: 'Saturday', label: 'السبت' },
    { key: 'Sunday', label: 'الأحد' }
  ];

  const hours = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

  // Simple logic to get current week start
  const getTasksForSlot = (dayLabel: string, hour: string) => {
    return state.tasks.filter(t => {
      // In a real app we'd match the actual date. 
      // For this UI, we show tasks assigned to the current day for visualization.
      const taskHour = t.time.split(':')[0];
      const slotHour = hour.split(':')[0];
      return taskHour === slotHour && t.status !== 'Completed';
    });
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <CalendarDays className="text-blue-600" size={32} /> جدول عمل الزبائن الأسبوعي
          </h2>
          <p className="text-slate-500 font-medium">نظرة شاملة على توزيع المهام الميدانية خلال ساعات العمل</p>
        </div>
        <div className="flex gap-2">
           <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
             <ChevronRight size={20} />
           </button>
           <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
             <ChevronLeft size={20} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-6 border-b border-slate-800 w-24 sticky right-0 bg-slate-900 z-20">
                   <Clock size={20} className="mx-auto text-blue-400" />
                </th>
                {days.map(day => (
                  <th key={day.key} className="p-6 border-b border-slate-800 text-sm font-black uppercase tracking-widest min-w-[200px]">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map(hour => (
                <tr key={hour} className="group">
                  <td className="p-6 border-b border-slate-50 text-center font-black text-slate-400 text-xs sticky right-0 bg-white group-hover:bg-slate-50 z-20 transition-all">
                    {hour}
                  </td>
                  {days.map(day => {
                    const slotTasks = getTasksForSlot(day.label, hour);
                    return (
                      <td key={`${day.key}-${hour}`} className="p-4 border-b border-slate-50 border-r border-slate-50 min-h-[100px] relative group-hover:bg-slate-50/50 transition-all">
                        <div className="space-y-2">
                          {slotTasks.map(task => {
                            const client = state.clients.find(c => c.id === task.clientId);
                            return (
                              <div key={task.id} className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg animate-in zoom-in duration-300 group/task hover:scale-105 transition-transform cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                  <User size={10} className="text-blue-200" />
                                  <span className="text-[10px] font-black truncate">{client?.name || 'زبون غير معروف'}</span>
                                </div>
                                <h4 className="text-[11px] font-black mb-1 leading-tight">{task.title}</h4>
                                <div className="flex items-center gap-2 text-[8px] font-bold text-blue-200">
                                  <HardHat size={8} />
                                  <span>{task.technician}</span>
                                </div>
                              </div>
                            );
                          })}
                          {slotTasks.length === 0 && (
                            <div className="h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="text-slate-300 hover:text-blue-500 transition-colors">
                                  <Plus size={16} />
                                </button>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-10 flex gap-8 items-center justify-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm w-fit mx-auto">
         <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase">مهمة تقنية</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase">قيد الانتظار</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-slate-100 rounded-full border border-slate-200"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase">وقت متاح</span>
         </div>
      </div>
    </div>
  );
};

export default CustomerWorkSchedulePage;
