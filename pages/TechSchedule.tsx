
import React, { useState } from 'react';
import { AppState, Technician } from '../types';
import { Clock, HardHat, CalendarDays, Save, Trash2, CheckCircle2 } from 'lucide-react';

interface TechSchedulePageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const TechSchedulePage: React.FC<TechSchedulePageProps> = ({ state, updateState }) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(state.technicians[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);

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

  const selectedTech = state.technicians.find(t => t.id === selectedTechId);

  const toggleHour = (dayKey: string, hour: string) => {
    if (!selectedTechId) return;

    updateState(prev => ({
      ...prev,
      technicians: prev.technicians.map(t => {
        if (t.id === selectedTechId) {
          const currentSchedule = t.weeklySchedule || {};
          const dayHours = currentSchedule[dayKey] || [];
          
          const newDayHours = dayHours.includes(hour)
            ? dayHours.filter(h => h !== hour)
            : [...dayHours, hour];

          return {
            ...t,
            weeklySchedule: {
              ...currentSchedule,
              [dayKey]: newDayHours
            }
          };
        }
        return t;
      })
    }));
  };

  const isHourSelected = (dayKey: string, hour: string) => {
    return selectedTech?.weeklySchedule?.[dayKey]?.includes(hour) || false;
  };

  const clearSchedule = () => {
    if (confirm('هل تريد مسح جدول هذا الأسبوع بالكامل لهذا التقني؟')) {
      updateState(prev => ({
        ...prev,
        technicians: prev.technicians.map(t => 
          t.id === selectedTechId ? { ...t, weeklySchedule: {} } : t
        )
      }));
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Clock className="text-blue-600" size={32} /> الجدولة الأسبوعية للتقنيين
          </h2>
          <p className="text-slate-500 font-medium text-sm">تحديد ساعات العمل والتدخلات الميدانية بشكل يدوي لكل تقني</p>
        </div>
        
        <div className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
           <label className="text-[10px] font-black text-slate-400 uppercase mr-2">اختيار التقني:</label>
           <select 
             className="bg-slate-50 border-none font-black text-slate-800 focus:ring-0 cursor-pointer"
             value={selectedTechId}
             onChange={(e) => setSelectedTechId(e.target.value)}
           >
             {state.technicians.map(t => (
               <option key={t.id} value={t.id}>{t.name}</option>
             ))}
           </select>
        </div>
      </div>

      {!selectedTech ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
           <HardHat size={60} className="mx-auto text-slate-200 mb-4" />
           <p className="text-slate-400 font-black text-xl">يرجى إضافة تقني أولاً للبدء بالجدولة</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="flex gap-4">
                <button 
                  onClick={clearSchedule}
                  className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-red-100 transition-all"
                >
                   <Trash2 size={16} /> مسح الجدول
                </button>
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                   <span>ساعات عمل</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-slate-100 rounded-sm border border-slate-200"></div>
                   <span>وقت راحة / غير متاح</span>
                </div>
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
                      <th key={day.key} className="p-6 border-b border-slate-800 text-sm font-black uppercase tracking-widest min-w-[150px] text-center">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map(hour => (
                    <tr key={hour} className="group">
                      <td className="p-4 border-b border-slate-50 text-center font-black text-slate-400 text-[10px] sticky right-0 bg-white group-hover:bg-slate-50 z-20 transition-all border-l border-slate-100">
                        {hour}
                      </td>
                      {days.map(day => {
                        const active = isHourSelected(day.key, hour);
                        return (
                          <td 
                            key={`${day.key}-${hour}`} 
                            onClick={() => toggleHour(day.key, hour)}
                            className={`p-1 border-b border-slate-50 border-r border-slate-50 cursor-pointer transition-all duration-200 group-hover:bg-slate-50/50`}
                          >
                            <div className={`h-12 w-full rounded-xl flex items-center justify-center transition-all ${
                              active 
                              ? 'bg-blue-600 text-white shadow-lg scale-95' 
                              : 'bg-transparent text-transparent'
                            }`}>
                               {active && <CheckCircle2 size={16} />}
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

          <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <HardHat size={24} />
                </div>
                <div>
                   <h4 className="font-black text-lg">تقني حالي: {selectedTech.name}</h4>
                   <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">يتم حفظ التغييرات تلقائياً في قاعدة البيانات</p>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="text-center bg-white/10 px-6 py-2 rounded-2xl">
                   <p className="text-[8px] font-black uppercase mb-1">إجمالي ساعات العمل</p>
                   <p className="text-xl font-black">
                     {Object.values(selectedTech.weeklySchedule || {}).flat().length} <span className="text-[10px]">ساعة/أسبوع</span>
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechSchedulePage;
