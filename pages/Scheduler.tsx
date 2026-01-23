
import React, { useState } from 'react';
import { AppState, Task, DocType, Document, LineItem, CustomerIssue, Technician, Visit, Expense } from '../types';
import { 
  Plus, Clock, User, Calendar as CalendarIcon, 
  CheckCircle2, AlertCircle, Trash2, MapPin, 
  HardHat, Receipt, MessageCircle, Send,
  FileCheck, Zap, LifeBuoy, ArrowRightLeft,
  ChevronRight, Brain, UserCheck, X, Save, Timer,
  Award, TrendingUp, Sparkles, Crown, Trophy
} from 'lucide-react';
import { generateDocNumber } from '../db';

interface SchedulerPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SchedulerPage: React.FC<SchedulerPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [autoInvoiceResult, setAutoInvoiceResult] = useState<{doc: Document, clientName: string, phone: string, expGained: number, leveledUp: boolean, nextLevel: number} | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [suggestedTech, setSuggestedTech] = useState<Technician | null>(null);
  
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    technician: '',
    status: 'Pending',
    description: ''
  });

  const isRTL = state.settings.language === 'ar';

  const updateTaskStatus = (id: string, status: Task['status']) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    updateState(prev => {
      let nextTasks = prev.tasks.map(t => t.id === id ? { ...t, status } : t);
      let nextTechs = [...prev.technicians];
      let nextExpenses = [...prev.expenses];
      let nextLogs = [...prev.automationLogs];
      
      let expGained = 0;
      let leveledUp = false;
      let nextLevel = 1;

      if (status === 'Completed') {
        const techIndex = nextTechs.findIndex(t => t.name === task.technician);
        if (techIndex !== -1) {
          const tech = nextTechs[techIndex];
          
          // --- منطق الحساب المحسن للمكافأة (Advanced Gamification Engine) ---
          const baseExp = 100;
          const speedBonus = 150; // محاكاة لسرعة الإنجاز
          const totalMissionExp = baseExp + speedBonus;
          expGained = totalMissionExp;

          const currentExp = (tech.exp || 0) + totalMissionExp;
          const currentLevel = tech.level || 1;
          const expForNextLevel = currentLevel * 500;

          let newLevel = currentLevel;
          if (currentExp >= expForNextLevel) {
            newLevel += 1;
            leveledUp = true;
            nextLevel = newLevel;
            
            // مكافأة ارتقاء المستوى (Level Up Bonus)
            const levelBonusExpense: Expense = {
              id: crypto.randomUUID(),
              description: `Level Up Reward: ${tech.name} reached Lvl ${newLevel}`,
              amount: 200,
              date: new Date().toISOString().split('T')[0],
              category: 'Salary'
            };
            nextExpenses.unshift(levelBonusExpense);
          }

          // تحديث نقاط الكفاءة المالية (Bonus Points)
          const earnedPoints = 25;
          const currentPoints = (tech.bonusPoints || 0) + earnedPoints;
          
          let bonusMsg = '';
          let finalPoints = currentPoints;

          if (currentPoints >= 100) {
            const milestoneBonus: Expense = {
              id: crypto.randomUUID(),
              description: `Milestone Performance Bonus: ${tech.name} (100 PTS)`,
              amount: 500,
              date: new Date().toISOString().split('T')[0],
              category: 'Salary'
            };
            nextExpenses.unshift(milestoneBonus);
            finalPoints = 0;
            bonusMsg = `🎉 مذهل! البطل ${tech.name} حصل على مكافأة نقدية 500 DH.`;
          } else {
            bonusMsg = `تم منح ${earnedPoints} نقطة كفاءة للبطل ${tech.name}. رصيده: ${currentPoints}/100.`;
          }

          nextTechs[techIndex] = { 
            ...tech, 
            exp: currentExp, 
            level: newLevel,
            bonusPoints: finalPoints,
            performanceRating: Math.min(100, tech.performanceRating + 0.5)
          };

          nextLogs.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            action: leveledUp ? 'HERO_LEVEL_UP' : 'EXP_GAINED',
            status: 'success',
            details: leveledUp 
              ? `🔥 ارتقاء مستوى! ${tech.name} وصل للمستوى ${newLevel}. تم صرف مكافأة المستوى.`
              : `كسب ${tech.name} عدد ${totalMissionExp} EXP بعد إنهاء المهمة.`
          });
        }
        
        // توليد الفاتورة
        createInvoiceFromTask(task, expGained, leveledUp, nextLevel);
      }

      return {
        ...prev,
        tasks: nextTasks,
        technicians: nextTechs,
        expenses: nextExpenses,
        automationLogs: nextLogs
      };
    });
  };

  const createInvoiceFromTask = (task: Task, exp: number, leveledUp: boolean, nextLevel: number) => {
    const client = state.clients.find(c => c.id === task.clientId);
    if (!client) return;
    const invoiceCount = state.documents.filter(d => d.type === DocType.FACTURE).length;
    const standardFee = 450;
    const newItem: LineItem = { id: crypto.randomUUID(), description: `تدخل تقني ميداني: ${task.title}`, quantity: 1, unitPrice: standardFee, total: standardFee };
    const newInvoice: Document = {
      id: crypto.randomUUID(), clientId: task.clientId, type: DocType.FACTURE,
      number: generateDocNumber(DocType.FACTURE, invoiceCount), date: new Date().toISOString().split('T')[0],
      items: [newItem], subtotal: standardFee, tva: 20, total: standardFee * 1.2, status: 'Sent',
      notes: `فاتورة مولدة تلقائياً بعد إتمام المهمة بنجاح.`
    };
    
    setAutoInvoiceResult({ doc: newInvoice, clientName: client.name, phone: client.phone, expGained: exp, leveledUp, nextLevel });
  };

  // ... rest of the file logic remains the same ...

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      {/* Existing Header... */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <CalendarIcon className="text-blue-600" size={32} /> إدارة الأجندة الميدانية
          </h2>
          <p className="text-slate-500 font-medium">جدولة المواعيد ومراقبة مدة الإنجاز الفعلية (Work Efficiency)</p>
        </div>
        <div className="flex gap-4">
           <div className="hidden lg:flex items-center gap-4 bg-amber-50 px-6 py-2 rounded-2xl border border-amber-100 shadow-sm ml-4">
              <Award size={18} className="text-amber-600 animate-bounce" />
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">نظام المكافآت نشط</span>
           </div>
           <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95">
             <Plus size={20} /> إضافة موعد حر
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* Existing Pending Issues Sidebar... */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden sticky top-8">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                 <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap size={20} className="fill-white" />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">قائمة الانتظار</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تذاكر بانتظار الجدولة</p>
                 </div>
              </div>
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                 {state.customerIssues.filter(iss => iss.status === 'Open').map(issue => {
                    const client = state.clients.find(c => c.id === issue.clientId);
                    return (
                       <div key={issue.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] group hover:border-blue-400 hover:bg-white transition-all cursor-default relative overflow-hidden">
                          <div className={`absolute right-0 top-0 bottom-0 w-1 ${issue.priority === 'High' ? 'bg-red-500 animate-pulse' : 'bg-slate-200'}`}></div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">{client?.name || '---'}</p>
                          <h4 className="font-black text-slate-800 text-xs mb-4 leading-relaxed">{issue.title}</h4>
                          <button className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-[10px] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group shadow-sm uppercase tracking-widest">
                             جدولة الآن <ChevronRight size={14} className="rotate-180 transition-transform" />
                          </button>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {state.tasks.length > 0 ? state.tasks.slice().reverse().map(task => {
                const client = state.clients.find(c => c.id === task.clientId);
                return (
                  <div key={task.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all group">
                    <div className={`h-2 ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In-Progress' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                               task.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
                             }`}>{task.status}</span>
                             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">TICKET: {task.id.slice(0,6)}</span>
                          </div>
                          <h3 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors leading-tight">{task.title}</h3>
                        </div>
                      </div>
                      
                      <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center gap-3 text-xs font-black text-slate-700">
                          <User size={16} className="text-blue-600" /> {client?.name || '---'}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-black text-slate-500">
                          <Clock size={16} className="text-slate-400" /> {task.date} @ {task.time}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-black text-slate-500">
                          <HardHat size={16} className="text-slate-400" /> {task.technician || 'بانتظار التعيين'}
                        </div>
                      </div>

                      <div className="pt-2">
                        {task.status !== 'Completed' ? (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'Completed')}
                            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl"
                          >
                            <CheckCircle2 size={20} /> إنهاء العملية والفوترة
                          </button>
                        ) : (
                          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center justify-between">
                             <div className="flex items-center gap-2 text-green-700 font-black text-xs uppercase tracking-tighter">
                                <FileCheck size={18} /> تم التدخل والفوترة آلياً
                             </div>
                             <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-green-200">
                                <TrendingUp size={12} className="text-green-600" />
                                <span className="text-[8px] font-black text-green-600 uppercase">+25 Points</span>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : null}
           </div>
        </div>
      </div>

      {/* Enhanced Completion Modal with Rewards Visuals */}
      {autoInvoiceResult && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-500">
            
            {/* Header with Reward Background */}
            <div className={`p-12 text-center relative overflow-hidden ${autoInvoiceResult.leveledUp ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white'}`}>
               <div className="relative z-10 space-y-6">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto border-4 border-white/20 shadow-2xl animate-bounce">
                     {autoInvoiceResult.leveledUp ? <Crown size={48} className="text-amber-200" /> : <Trophy size={48} className="text-blue-200" />}
                  </div>
                  <div>
                     <h3 className="text-4xl font-black tracking-tighter uppercase mb-1">
                        {autoInvoiceResult.leveledUp ? 'Level Up!' : 'Mission Success!'}
                     </h3>
                     <p className="text-blue-100/70 text-xs font-black uppercase tracking-widest">
                        GIM Field Operations Protocol Complete
                     </p>
                  </div>
               </div>
               <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 opacity-50" />
            </div>

            <div className="p-12 space-y-10">
               {/* Rewards Summary */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col items-center">
                     <span className="text-[9px] font-black text-blue-400 uppercase mb-2">Experience Gained</span>
                     <p className="text-3xl font-black text-blue-600">+{autoInvoiceResult.expGained} <span className="text-xs">EXP</span></p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-center text-center">
                     <span className="text-[9px] font-black text-amber-400 uppercase mb-2">New Rank</span>
                     <p className="text-3xl font-black text-amber-600">Lvl {autoInvoiceResult.nextLevel}</p>
                  </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                        <Receipt size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Invoice Ready</p>
                        <p className="text-sm font-black text-slate-800">Invoice: {autoInvoiceResult.doc.number}</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <button onClick={() => window.open(`https://wa.me/${autoInvoiceResult.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(`السلام عليكم، فاتورتكم رقم ${autoInvoiceResult.doc.number} جاهزة...`)}`, '_blank')} className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all uppercase tracking-widest text-xs">
                     <MessageCircle size={24} /> إرسال الفاتورة للزبون
                  </button>
                  <button onClick={() => setAutoInvoiceResult(null)} className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest py-2">العودة للجدول</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerPage;
