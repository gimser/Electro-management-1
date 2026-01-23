
import React from 'react';
import { AppState, DocType, UserRole } from '../types';
// Added Box to the imports from lucide-react
import { 
  Zap, Activity, TrendingUp, Users, Wallet, 
  ShieldCheck, Microscope, Navigation2, Network, 
  Monitor, Cpu, Brain, Rocket, Radio, Eye, Server,
  Lock, ArrowRightLeft, Database, ChevronUp, Clock,
  ArrowUpRight, ShieldAlert, CheckCircle2, LayoutGrid, Box
} from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];
  const paidInvoices = state.documents.filter(d => d.type === DocType.FACTURE && d.status === 'Paid');
  const dailyIncome = paidInvoices.filter(d => d.date === today).reduce((acc, d) => acc + d.total, 0);
  const autoDecisions = state.autonomousDecisions || [];
  const successRate = autoDecisions.length > 0 
    ? Math.round((autoDecisions.filter(d => d.status === 'Executed').length / autoDecisions.length) * 100) 
    : 100;

  return (
    <div className="space-y-12 animate-slide-up text-right" dir="rtl">
      
      {/* Dynamic Status Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Core AI Heart Card */}
        <div className="xl:col-span-2 bg-[#0f172a] rounded-[4rem] p-12 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)] group border border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.15),transparent)] pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
            <Cpu size={400} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
              <div className="flex items-center gap-8 text-center md:text-right">
                <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.5)] border border-blue-400/20 group-hover:scale-110 transition-all duration-500 rotate-3">
                  <Brain size={48} className="text-white" />
                </div>
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">GIM-CORE <span className="text-blue-500">v2.0</span></h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]"></span>
                      <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">AI Engine Active</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:inline">Protocol: Neural-Decision-v4</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 text-center min-w-[180px]">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">ثقة المحرك الذكي</p>
                <p className="text-5xl font-black text-white font-mono">{successRate}<span className="text-xl text-blue-500">%</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/5">
              {[
                { label: "العمليات المؤتمتة", val: (state.automationLogs || []).length, unit: "إجراء", color: "text-blue-400" },
                { label: "سرعة الاستجابة", val: "240", unit: "ms", color: "text-green-400" },
                { label: "نقاط التدخل", val: state.technicians.length, unit: "عقدة", color: "text-amber-400" },
                { label: "الأداء العام", val: "99.2", unit: "%", color: "text-white" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-tighter">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.val} <span className="text-xs opacity-50">{stat.unit}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Pulse Card */}
        <div className="bg-white rounded-[4rem] p-12 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col justify-between group hover:border-blue-500/30 transition-all relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100%] transition-all group-hover:bg-blue-600 group-hover:scale-150 duration-700 opacity-20"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
              <Wallet size={36} />
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2">
              <ChevronUp size={16} /> 14.5%
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">مداخيل اليوم المحصلة</p>
            <p className="text-5xl font-black text-slate-900 font-mono tracking-tighter">{dailyIncome.toLocaleString()} <span className="text-xl text-slate-300">DH</span></p>
            <div className="mt-8 flex items-center gap-3 text-[11px] font-bold text-slate-500 border-t border-slate-100 pt-6">
              <Clock size={16} className="text-blue-500" />
              <span>آخر مزامنة مالية: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "المهام النشطة", val: state.tasks.filter(t => t.status !== 'Completed').length, icon: <Navigation2 />, color: "blue", trend: "+2" },
          { label: "قاعدة الزبناء", val: state.clients.length, icon: <Users />, color: "indigo", trend: "NEW" },
          { label: "تذاكر الدعم", val: state.customerIssues.filter(i => i.status === 'Open').length, icon: <ShieldAlert />, color: "red", trend: "ACTION" },
          { label: "المخزون الحرج", val: state.inventory.filter(i => i.quantity <= i.minQuantity).length, icon: <Box />, color: "amber", trend: "RESTOCK" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer" onClick={() => onNavigate(kpi.label === 'المهام النشطة' ? 'visits' : 'clients')}>
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:bg-${kpi.color}-600 group-hover:text-white transition-all duration-500 shadow-inner`}>
                {React.cloneElement(kpi.icon as React.ReactElement, { size: 28 })}
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${kpi.trend === 'ACTION' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>{kpi.trend}</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase mb-1 tracking-widest">{kpi.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* Decision Flow & Tactical Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Living Log Terminal */}
        <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
          <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-blue-500 shadow-lg">
                <Activity size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">تدفق القرارات اللحظي</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time GIM Decision stream</p>
              </div>
            </div>
            <button className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">توسيع السجل</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
            {autoDecisions.length > 0 ? autoDecisions.slice().reverse().map(decision => (
              <div key={decision.id} className="flex items-start gap-8 p-6 rounded-3xl border border-slate-50 hover:bg-slate-50/80 hover:border-blue-100 transition-all group">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-600 transition-colors">
                  <Zap size={24} className="text-amber-500 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{decision.triggerEvent}</span>
                    <span className="text-[9px] font-bold text-slate-300 font-mono">{new Date(decision.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-slate-800 font-black text-base mb-3 leading-snug">{decision.actionTaken}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{width: `${decision.confidenceScore}%`}}></div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Confidence {decision.confidenceScore}%</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-20">
                <LayoutGrid size={100} strokeWidth={1} className="mb-6" />
                <p className="font-black text-2xl uppercase tracking-widest">بانتظار تفعيل أول استجابة عصبية</p>
              </div>
            )}
          </div>
        </div>

        {/* Insight Sidebar */}
        <div className="space-y-8">
          {/* AI Strategy Card */}
          <div className="bg-[#0f172a] rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                  <Brain size={24} className="text-blue-400 animate-pulse" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-100">تحليل الاستراتيجية</h3>
              </div>
              
              <div className="space-y-8">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">عمق الأتمتة الحالية</p>
                    <span className="text-blue-400 text-lg font-black">{state.settings.aiAutomationLevel}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.8)]" style={{width: `${state.settings.aiAutomationLevel}%`}}></div>
                  </div>
                </div>
                
                <div className="bg-blue-600/20 border border-blue-500/30 p-8 rounded-[2.5rem] flex items-start gap-6">
                  <Rocket size={32} className="text-blue-400 shrink-0" />
                  <p className="text-xs font-bold text-blue-100 leading-relaxed italic">
                    "المحرك الذكي يقوم حالياً بمسح جداول التقنيين لضمان تغطية جغرافية مثالية بنسبة 94%."
                  </p>
                </div>
              </div>
            </div>
            <Activity size={200} className="absolute -left-20 -bottom-20 text-blue-500/5 group-hover:scale-125 transition-transform duration-700" />
          </div>

          {/* Operational Nodes Widget */}
          <div className="bg-white rounded-[3.5rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <Radio size={18} className="text-blue-600" /> وحدات العمل الميدانية
              </h3>
              <span className="text-[9px] font-black text-blue-600 hover:underline cursor-pointer">الكل</span>
            </div>
            <div className="space-y-6">
              {state.technicians.slice(0, 4).map(tech => (
                <div key={tech.id} className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-2xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm ${tech.status === 'Active' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{tech.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{tech.specialty}</p>
                    </div>
                  </div>
                  {tech.status === 'Active' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
