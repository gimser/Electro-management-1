
import React, { useState, useEffect } from 'react';
import { AppState, Visit, VisitStatus, UserRole, DocType, Document, LineItem, Task, AutonomousDecision, Client, Technician } from '../types';
import { 
  Navigation2, Clock, User, HardHat, 
  Play, Square, CheckCircle2, 
  MapPin, Calendar, Timer, PhoneCall,
  ExternalLink, Stethoscope, RefreshCw,
  Search, ShieldCheck, ReceiptText, Radio,
  ArrowRightCircle, Zap, Mic, MicOff, MessageSquare,
  Map as MapIcon, Navigation, Target, UserPlus,
  ArrowUpRight, Info, Lock, Unlock, AlertTriangle,
  Phone, ChevronLeft, Activity, ListChecks,
  Sparkles, Flame, Trophy, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateDocNumber } from '../db';

interface VisitsPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const VisitsPage: React.FC<VisitsPageProps> = ({ state, updateState, onNavigate }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  const isTechnician = user?.role === 'Technician';
  
  // العثور على ملف التقني الحالي في قاعدة البيانات بناءً على الاسم الكامل للمستخدم المسجل
  const currentTech = state.technicians.find(t => 
    t.name.trim().toLowerCase() === user?.fullName.trim().toLowerCase()
  );

  // دالة قبول المهمة من البث العام
  const handleAcceptJob = (visitId: string) => {
    if (!currentTech) {
      alert("خطأ: لم يتم العثور على ملفك التقني في النظام. يرجى مراجعة المسؤول.");
      return;
    }

    updateState(prev => {
      const visit = prev.visits.find(v => v.id === visitId);
      // الحماية: التأكد أن المهمة لا تزال متاحة (BROADCAST) ولم يخطفها تقني آخر في نفس اللحظة
      if (!visit || (visit.technicianId !== 'BROADCAST' && visit.technicianId !== 'BROADCAST_POOL')) return prev; 

      const bonusExp = 50; 
      
      const nextVisits = prev.visits.map(v => 
        v.id === visitId ? { ...v, technicianId: currentTech.id, status: 'Planned' as VisitStatus } : v
      );

      const nextTasks = prev.tasks.map(t => 
        t.id === visit.taskId ? { ...t, technician: currentTech.name } : t
      );

      const nextTechs = prev.technicians.map(t => 
        t.id === currentTech.id ? { ...t, exp: (t.exp || 0) + bonusExp } : t
      );

      return {
        ...prev,
        visits: nextVisits,
        tasks: nextTasks,
        technicians: nextTechs,
        automationLogs: [{
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action: 'HERO_CLAIMED_MISSION',
          status: 'success',
          details: `البطل ${currentTech.name} (تقني جديد/موجود) قبل المهمة بنجاح.`
        }, ...(prev.automationLogs || [])]
      };
    });

    alert('تمت المهمة! انطلقت الآن في جدولك الشخصي. بالتوفيق يا بطل! 🚀');
  };

  const handleNavigateToGps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  // المهام الشخصية للتقني (التي قبلها أو أسندت له بالاسم)
  const myVisits = (state.visits || []).filter(v => {
    if (!isTechnician || !currentTech) return false;
    return v.technicianId === currentTech.id && v.status !== 'Completed';
  });

  // المهام العامة المتاحة للجميع (Broadcast Pool)
  // تم تحسين الشرط ليشمل أي مهمة تحمل وسم البث العام
  const broadcastVisits = (state.visits || []).filter(v => 
    (v.technicianId === 'BROADCAST' || v.technicianId === 'BROADCAST_POOL') && 
    v.status === 'Planned'
  );

  const filteredVisits = (state.visits || []).filter(v => {
    const client = state.clients.find(c => c.id === v.clientId);
    return (client?.name.toLowerCase().includes(search.toLowerCase()) || v.notes?.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isTechnician ? 'font-arabic' : ''}`} dir="rtl">
      
      {/* بطاقة الترحيب والتقدم - تظهر للتقني الجديد أيضاً */}
      {isTechnician && (
        <div className="bg-slate-900 p-10 rounded-[3.5rem] border-4 border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.1),transparent)]"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-blue-400/30">
                  <span className="text-3xl font-black text-white">{user?.username.charAt(0).toUpperCase()}</span>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h2 className="text-3xl font-black text-white">مرحباً، {user?.fullName.split(' ')[0]}</h2>
                     {currentTech && <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">LEVEL {currentTech.level || 1}</span>}
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                     <Award size={14} className="text-blue-500" /> {currentTech?.specialty || 'تقني معتمد'} — GIM Hero System
                  </p>
               </div>
            </div>
            
            {currentTech && (
              <div className="w-full md:w-80 space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-400">
                    <span>نقاط الخبرة (EXP)</span>
                    <span>{currentTech.exp || 0} / {(currentTech.level || 1) * 500}</span>
                 </div>
                 <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-blue-600 shadow-[0_0_15px_#2563eb]" style={{width: `${Math.min(100, ((currentTech.exp || 0) / ((currentTech.level || 1) * 500)) * 100)}%`}}></div>
                 </div>
              </div>
            )}
          </div>
          <Sparkles className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
        </div>
      )}

      {/* سوق المهمات - هنا تظهر المهام لجميع التقنيين بمن فيهم الجديد */}
      {broadcastVisits.length > 0 && (
         <div className="space-y-6 animate-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                     <Flame size={22} />
                  </div>
                  <div>
                     <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">سوق المهمات المفتوحة</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">المهام التالية متاحة للقبول الفوري من قبل أي تقني</p>
                  </div>
               </div>
               <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
                  <Radio size={14} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase">بث حي نشط</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {broadcastVisits.map(visit => {
                  const client = state.clients.find(c => c.id === visit.clientId);
                  return (
                     <div key={visit.id} className="bg-white border-4 border-blue-50 rounded-[3rem] p-8 flex flex-col justify-between shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
                        <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg z-20">
                           +150 EXP
                        </div>
                        <div className="mb-8 relative z-10">
                           <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl uppercase mb-4 inline-block">{client?.city}</span>
                           <h4 className="font-black text-slate-800 text-2xl mb-2">{client?.name}</h4>
                           <p className="text-sm text-slate-500 font-bold mb-6 line-clamp-2 italic leading-relaxed">"{visit.notes || 'بلاغ تقني جديد بانتظار المعاينة.'}"</p>
                           <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
                              <MapPin size={16} className="text-blue-500" />
                              <span className="truncate">{client?.address}</span>
                           </div>
                        </div>
                        <button 
                           onClick={() => handleAcceptJob(visit.id)} 
                           className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                           <ShieldCheck size={22} /> التقاط هذه المهمة
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      {/* مهامي الشخصية - تظهر فيها المهام بعد القبول */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-4 border-t border-slate-100 pt-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <ListChecks size={22} />
               </div>
               <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">خريطة عملياتي الجارية</h3>
            </div>
            {!isTechnician && (
              <div className="relative w-48 lg:w-72">
                <Search className="absolute right-4 top-3 text-slate-400" size={18} />
                <input className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold shadow-inner" placeholder="بحث في الأجندة..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(isTechnician ? myVisits : filteredVisits).slice().reverse().map(visit => {
               const client = state.clients.find(c => c.id === visit.clientId);
               const isWaiting = visit.status === 'Waiting-Approval';
               
               return (
                  <div key={visit.id} className={`rounded-[3rem] border p-8 transition-all relative overflow-hidden group shadow-sm hover:shadow-2xl bg-white ${isTechnician ? 'border-slate-100 hover:border-blue-200' : 'border-slate-200'}`}>
                     <div className="flex justify-between items-start mb-8">
                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase border shadow-sm ${isWaiting ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' : visit.status === 'On-Site' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                           {isWaiting ? 'بانتظار إشارة الزبون' : visit.status === 'On-Site' ? 'قيد التنفيذ' : 'مجدولة'}
                        </span>
                        <div className="flex gap-2">
                           <a href={`tel:${client?.phone}`} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><Phone size={20} /></a>
                           <button onClick={() => handleNavigateToGps(client?.address || '')} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Navigation size={20} /></button>
                        </div>
                     </div>

                     <div className="mb-10">
                        <h4 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{client?.name}</h4>
                        <div className="flex items-start gap-2 text-slate-400">
                           <MapPin size={16} className="mt-1 text-blue-500 shrink-0" />
                           <p className="text-xs font-bold leading-relaxed">{client?.address}</p>
                        </div>
                     </div>

                     <div className="space-y-4 pt-8 border-t border-slate-50">
                        {visit.status === 'Planned' && (
                           <button onClick={() => updateState(prev => ({ ...prev, visits: prev.visits.map(v => v.id === visit.id ? { ...v, status: 'On-Site', checkInTime: new Date().toISOString() } : v) }))} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                              <Play size={20} className="fill-current" /> بدء التوجه للموقع
                           </button>
                        )}
                        {visit.status === 'On-Site' && !isWaiting && (
                           <button onClick={() => onNavigate('technical-analysis')} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                              <Stethoscope size={22} /> إجراء الفحص والتحليل
                           </button>
                        )}
                        {isWaiting && (
                           <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2.5rem] text-center flex flex-col items-center gap-3 shadow-inner">
                              <Lock size={24} className="text-amber-500" />
                              <div>
                                 <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">مهمة قيد الانتظار</p>
                                 <p className="text-[10px] text-amber-600 font-bold mt-1">يرجى من الزبون قبول عرض الثمن لفتح المهمة.</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
         
         {myVisits.length === 0 && broadcastVisits.length === 0 && (
            <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-white/50">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Sparkles size={48} className="text-slate-200" />
               </div>
               <p className="text-slate-400 font-black text-2xl tracking-tighter uppercase">لا توجد مهام حالياً</p>
               <p className="text-slate-300 font-bold mt-2">استرح قليلاً، أو انتظر إشعارات المهام العاجلة.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default VisitsPage;
