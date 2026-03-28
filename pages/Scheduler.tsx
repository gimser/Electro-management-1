
import React, { useState } from 'react';
import { AppState, Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Clock, User, Calendar as CalendarIcon, 
  CheckCircle2, AlertCircle, Trash2, MapPin, 
  X, Save, ChevronRight
} from 'lucide-react';

interface SchedulerPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SchedulerPage: React.FC<SchedulerPageProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    technician: state.technicians[0]?.name || '',
    status: 'Pending',
    description: ''
  });

  const updateTaskStatus = (id: string, status: Task['status']) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, status } : t)
    }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.title) return alert('يرجى ملء الحقول الإجبارية');
    
    const newTask: Task = {
      ...formData,
      id: crypto.randomUUID()
    };
    
    updateState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      activityLogs: [{
        id: crypto.randomUUID(),
        userId: authUser?.id || 'system',
        username: authUser?.fullName || 'System',
        action: 'TASK_CREATED',
        module: 'SCHEDULER',
        timestamp: new Date().toISOString(),
        details: `تمت جدولة مهمة جديدة: ${newTask.title}`,
        severity: 'Info'
      }, ...(prev.activityLogs || [])]
    }));
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', clientId: '', date: new Date().toISOString().split('T')[0], 
      time: '10:00', technician: state.technicians[0]?.name || '', 
      status: 'Pending', description: '' 
    });
    setShowForm(false);
  };

  const deleteTask = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      updateState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id)
      }));
    }
  };

  return (
    <div className="p-8 animate-slide-up pb-24 text-right font-arabic max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <CalendarIcon className="text-blue-600" size={32} /> الأجندة اليومية والمهام
          </h2>
          <p className="text-slate-500 font-medium">تخطيط الزيارات الميدانية وعمليات التركيب</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={20} /> إضافة موعد عمل
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* Sidebar: Pending */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Clock size={18} />
                 </div>
                 <h3 className="font-black text-slate-800 text-sm">بلاغات بانتظار موعد</h3>
              </div>
              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                 {state.customerIssues.filter(iss => iss.status === 'Open').map(issue => (
                   <div key={issue.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-400 transition-all">
                      <p className="text-[9px] font-black text-blue-600 uppercase mb-1">{state.clients.find(c => c.id === issue.clientId)?.name}</p>
                      <h4 className="font-black text-slate-800 text-xs mb-4 line-clamp-1">{issue.title}</h4>
                      <button 
                        onClick={() => {
                          setFormData({...formData, clientId: issue.clientId, title: `معالجة: ${issue.title}`, description: issue.description});
                          setShowForm(true);
                        }}
                        className="w-full bg-white text-slate-900 border border-slate-200 font-black py-2 rounded-xl text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                         جدولة فورية
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Main: Task List */}
        <div className="lg:col-span-3">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.tasks.length > 0 ? state.tasks.map(task => {
                const client = state.clients.find(c => c.id === task.clientId);
                return (
                  <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                    <div className={`h-2 ${task.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <div className="p-8 space-y-6 flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                          task.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
                        }`}>{task.status}</span>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight">{task.title}</h3>
                      <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700"><User size={14} className="text-blue-500" /> {client?.name}</div>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><CalendarIcon size={14} className="text-slate-400" /> {task.date} - {task.time}</div>
                      </div>
                    </div>
                    {task.status !== 'Completed' && (
                      <div className="p-6 pt-0">
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'Completed')}
                          className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl active:scale-95"
                        >
                          <CheckCircle2 size={18} /> تأكيد الإتمام
                        </button>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] opacity-30">
                   <CalendarIcon size={48} className="mx-auto mb-4" />
                   <p className="font-black text-xl">الأجندة فارغة حالياً</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-2xl font-black">إضافة موعد عمل جديد</h3>
                <button onClick={resetForm} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleCreateTask} className="p-10 space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">اختيار الزبون</label>
                   <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                      <option value="">-- اختر الزبون --</option>
                      {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">عنوان المهمة</label>
                   <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="مثال: تركيب كاميرات المراقبة..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">التاريخ</label>
                      <input type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الوقت</label>
                      <input type="time" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">تعيين التقني</label>
                   <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.technician} onChange={e => setFormData({...formData, technician: e.target.value})}>
                      <option value="">-- اختر التقني --</option>
                      {state.technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                   </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                   <Save size={20} /> حفظ الموعد في الأجندة
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerPage;
