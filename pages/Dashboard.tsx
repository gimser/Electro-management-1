
import React from 'react';
import { AppState, DocType } from '../types';
import { 
  Crosshair, Wallet, AlertTriangle, Clock, 
  MapPin, CheckCircle2, ArrowRight, Activity,
  ShieldAlert, Calendar, DollarSign, TrendingUp,
  BarChart3, Zap, ShieldCheck
} from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // --- 1. SITUATION REPORT (TODAY) ---
  const todaysTasks = state.tasks.filter(t => t.date === today && t.status !== 'Completed');
  const todaysVisits = state.visits.filter(v => v.status === 'Planned' || v.status === 'On-Site'); // Simplified for "Today" logic ideally needs date on Visit
  
  // --- 2. URGENT ACTIONS (RED ALERTS) ---
  const urgentIssues = state.customerIssues.filter(i => i.priority === 'High' && i.status !== 'Resolved');
  const lowStockItems = state.inventory.filter(i => i.quantity <= (i.minStock || 0));
  const overdueInvoices = state.documents.filter(d => d.dueDate && d.dueDate < today && d.status !== 'Paid');

  // --- 3. CASH FLOW (TACTICAL NOW) ---
  // Money IN Today
  const incomeToday = state.documents
    .filter(d => (d.type === DocType.FACTURE || d.type === DocType.TICKET) && d.date === today)
    .reduce((acc, d) => acc + (d.paidAmount || 0), 0);

  // Money OUT Today
  const expensesToday = state.expenses
    .filter(e => e.date === today)
    .reduce((acc, e) => acc + e.amount, 0);

  const netToday = incomeToday - expensesToday;

  // --- 4. GROWTH (LEADS) ---
  const newLeadsToday = state.leads.filter(l => l.createdAt.split('T')[0] === today);
  const pendingLeadsCount = state.leads.filter(l => l.status === 'New').length;

  return (
    <div className="p-6 md:p-10 animate-slide-up text-right font-arabic max-w-7xl mx-auto space-y-8" dir="rtl">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
         <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Crosshair size={20} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Operations Center</span>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">لوحة القيادة الميدانية</h2>
            <p className="text-slate-500 font-bold text-sm">تركيز العمليات: {today}</p>
         </div>
         <div className="flex gap-3">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">الفرص الجديدة</span>
                <span className="text-xl font-black text-blue-600">{newLeadsToday.length}</span>
            </div>
            <button 
                onClick={() => onNavigate('analytics')}
                className="group flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-2xl transition-all"
            >
                <div className="text-left">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500">للمدير العام</span>
                    <span className="block text-xs font-black">التحليلات الاستراتيجية</span>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm"><BarChart3 size={18} /></div>
            </button>
         </div>
      </div>

      {/* --- SECTION 1: CASH FLOW NOW (Survival Metrics) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* IN */}
         <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><TrendingUp size={20}/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-white px-2 py-1 rounded">اليوم</span>
                </div>
                <p className="text-slate-500 text-xs font-bold mb-1">مداخيل الخزينة</p>
                <p className="text-3xl font-black text-slate-800 font-mono">+{incomeToday.toLocaleString()} <span className="text-sm">DH</span></p>
            </div>
         </div>

         {/* OUT */}
         <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group hover:border-red-300 transition-all">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl"><Wallet size={20}/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-white px-2 py-1 rounded">اليوم</span>
                </div>
                <p className="text-slate-500 text-xs font-bold mb-1">مصاريف التشغيل</p>
                <p className="text-3xl font-black text-slate-800 font-mono">-{expensesToday.toLocaleString()} <span className="text-sm">DH</span></p>
            </div>
         </div>

         {/* NET */}
         <div className={`border-2 p-6 rounded-[2rem] flex flex-col justify-between relative overflow-hidden text-white ${netToday >= 0 ? 'bg-slate-900 border-slate-800' : 'bg-red-600 border-red-700'}`}>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/10 rounded-xl"><Activity size={20}/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-white/10 px-2 py-1 rounded">الصافي</span>
                </div>
                <p className="text-blue-200 text-xs font-bold mb-1">السيولة المتوفرة (اليوم)</p>
                <p className="text-4xl font-black font-mono">{netToday > 0 ? '+' : ''}{netToday.toLocaleString()} <span className="text-lg opacity-50">DH</span></p>
            </div>
            <Zap className="absolute -right-5 -bottom-5 w-32 h-32 text-white/5 rotate-12" />
         </div>
      </div>

      {/* --- SECTION 2: SITREP (Operations) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Today's Mission List */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Clock className="text-blue-600" size={24} /> مهام اليوم العاجلة (Mission List)
            </h3>
            
            <div className="space-y-3">
                {todaysTasks.length > 0 ? todaysTasks.map(task => (
                    <div key={task.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-500 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xs border border-blue-100">
                                {task.time}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm">{task.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                                    <MapPin size={10} /> {state.clients.find(c => c.id === task.clientId)?.name}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('visits')} className="bg-slate-50 text-slate-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                            <ArrowRight size={18} className="rotate-180" />
                        </button>
                    </div>
                )) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2rem] text-center">
                        <CheckCircle2 className="mx-auto text-slate-300 mb-3" size={32} />
                        <p className="text-slate-400 font-bold text-xs">لا توجد مهام مجدولة لهذا اليوم. النظام في حالة استعداد.</p>
                    </div>
                )}
            </div>
         </div>

         {/* --- SECTION 3: THREAT INTEL (Urgent Actions) --- */}
         <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <ShieldAlert className="text-red-600" size={24} /> تنبيهات حمراء (Action Required)
            </h3>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {/* Critical Tickets */}
                {urgentIssues.length > 0 && (
                    <div className="p-4 border-b border-slate-100 bg-red-50/50">
                        <p className="text-[10px] font-black uppercase text-red-600 mb-2 flex items-center gap-2">
                            <AlertTriangle size={12} /> دعم فني طارئ ({urgentIssues.length})
                        </p>
                        <div className="space-y-2">
                            {urgentIssues.slice(0, 3).map(iss => (
                                <div key={iss.id} onClick={() => onNavigate('customer-support')} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm cursor-pointer hover:bg-red-50 transition-colors">
                                    <p className="font-bold text-xs text-slate-800 line-clamp-1">{iss.title}</p>
                                    <p className="text-[9px] text-slate-400 mt-1">{state.clients.find(c => c.id === iss.clientId)?.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Overdue Invoices */}
                {overdueInvoices.length > 0 && (
                    <div className="p-4 border-b border-slate-100">
                        <p className="text-[10px] font-black uppercase text-amber-600 mb-2 flex items-center gap-2">
                            <DollarSign size={12} /> فواتير متأخرة ({overdueInvoices.length})
                        </p>
                        <div className="space-y-2">
                            {overdueInvoices.slice(0, 2).map(doc => (
                                <div key={doc.id} onClick={() => onNavigate('invoices')} className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm cursor-pointer hover:bg-amber-50 transition-colors">
                                    <div className="flex justify-between">
                                        <p className="font-bold text-xs text-slate-800">{doc.number}</p>
                                        <p className="font-black text-xs text-red-600">{doc.total} DH</p>
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1">استحقاق: {doc.dueDate}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* System Status if Clear */}
                {urgentIssues.length === 0 && overdueInvoices.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <ShieldCheck size={32} />
                        </div>
                        <p className="font-black text-slate-800">النظام مؤمن بالكامل</p>
                        <p className="text-xs text-slate-500 mt-1">لا توجد تهديدات أو إجراءات عاجلة.</p>
                    </div>
                )}
            </div>
         </div>

      </div>
    </div>
  );
};

export default Dashboard;
