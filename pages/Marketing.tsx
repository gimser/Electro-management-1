
import React, { useState } from 'react';
import { AppState, DocType, Lead, Document, Client } from '../types';
import { 
  Zap, 
  Cpu, 
  Terminal, 
  Activity, 
  RefreshCw,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  Workflow,
  Truck,
  Radio,
  Stethoscope,
  Repeat,
  Target,
  ArrowUpRight,
  Navigation,
  Box,
  Trophy,
  Sparkles,
  ShoppingBag,
  ShieldAlert,
  HandCoins
} from 'lucide-react';
import { generateDocNumber } from '../db';

interface MarketingPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'control' | 'logs'>('control');
  const [isScanning, setIsScanning] = useState(false);
  const [isDebtScanning, setIsDebtScanning] = useState(false);

  // تعريف السيناريوهات البرمجية النشطة
  const activeScenarios = [
    {
      id: 'debt-recovery-loop',
      title: 'محرك التحصيل المتدرج (Debt Recovery)',
      status: 'Active',
      trigger: 'تجاوز تاريخ استحقاق الفاتورة',
      logic: '+3 أيام: تنبيه ودي -> +10 أيام: تنبيه رسمي -> +20 يوماً: حظر (Red Flag).',
      icon: <ShieldAlert className="text-red-500" />,
      color: 'red',
      impact: 'تحسين التدفق النقدي بنسبة 60%'
    },
    {
      id: 'cross-sell-loop',
      title: 'البيع المتقاطع الذكي (Smart Cross-Selling)',
      status: 'Active',
      trigger: 'قبول عرض ثمن كاميرات (CCTV)',
      logic: 'انتظار الفتحة الزمنية -> فحص الاهتمامات الأمنية -> توليد عرض "نظام إنذار" بخصم 10%.',
      icon: <Sparkles className="text-purple-500" />,
      color: 'purple',
      impact: 'زيادة الربح من الزبون بـ 40%'
    },
    {
      id: 'performance-loop',
      title: 'مكافأة الأداء الفني (Gamified Performance)',
      status: 'Active',
      trigger: 'إغلاق مهمة بنجاح في Scheduler',
      logic: 'قياس سرعة الإنجاز -> إضافة نقاط كفاءة للتقني -> توليد Bonus آلي عند الوصول لـ 100 نقطة.',
      icon: <Trophy className="text-amber-500" />,
      color: 'amber',
      impact: 'زيادة سرعة التدخل بـ 35%'
    },
    {
      id: 'purchasing-loop',
      title: 'التزويد التوقعي للمخزن (Predictive Re-stocking)',
      status: 'Active',
      trigger: 'نزول كمية صنف تحت الحد الأدنى',
      logic: 'مسح أرشيف المشتريات -> استخراج آخر مزود وأفضل ثمن -> توليد مسودة طلب شراء آلي (Draft PO).',
      icon: <Box className="text-blue-500" />,
      color: 'blue',
      impact: 'منع توقف العمليات بنسبة 100%'
    }
  ];

  // محرك مسح الديون (Scenario 1 Implementation)
  const runDebtRecoveryScanner = () => {
    setIsDebtScanning(true);
    
    setTimeout(() => {
      const now = new Date();
      const unpaidInvoices = state.documents.filter(d => 
        d.type === DocType.FACTURE && 
        d.status !== 'Paid' && 
        d.dueDate
      );

      let nudges = 0;
      let warnings = 0;
      let blocks = 0;

      updateState(prev => {
        const nextClients = [...prev.clients];
        const nextLogs = [...(prev.automationLogs || [])];

        unpaidInvoices.forEach(inv => {
          const dueDate = new Date(inv.dueDate!);
          const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          const clientIndex = nextClients.findIndex(c => c.id === inv.clientId);
          if (clientIndex === -1) return;

          let actionTaken = '';
          if (diffDays >= 20) {
            nextClients[clientIndex] = { ...nextClients[clientIndex], isRedFlagged: true, debtLevel: 'Blocked' };
            actionTaken = 'RED_FLAG_ACTIVE';
            blocks++;
          } else if (diffDays >= 10) {
            nextClients[clientIndex] = { ...nextClients[clientIndex], debtLevel: 'Warning' };
            actionTaken = 'FORMAL_NUDGE_SENT';
            warnings++;
          } else if (diffDays >= 3) {
            nextClients[clientIndex] = { ...nextClients[clientIndex], debtLevel: 'Nudge' };
            actionTaken = 'FRIENDLY_NUDGE_SENT';
            nudges++;
          }

          if (actionTaken) {
            nextLogs.unshift({
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              action: actionTaken,
              status: 'success',
              details: `تم اتخاذ إجراء "${actionTaken}" تجاه الزبون ${nextClients[clientIndex].name} بسبب تأخر الفاتورة ${inv.number} بـ ${diffDays} يوم.`
            });
          }
        });

        return { ...prev, clients: nextClients, automationLogs: nextLogs };
      });

      setIsDebtScanning(false);
      alert(`اكتمل مسح الديون:\n- تنبيهات ودية: ${nudges}\n- تنبيهات رسمية: ${warnings}\n- حالات حظر (Red Flag): ${blocks}`);
    }, 1200);
  };

  // محرك المسح للبيع المتقاطع
  const runCrossSellScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const acceptedSecurityDevis = state.documents.filter(d => 
        d.type === DocType.DEVIS && 
        d.status === 'Accepted' && 
        d.items.some(item => item.description.toLowerCase().includes('camera') || item.description.includes('كاميرا'))
      );
      let foundOpportunities = 0;
      updateState(prev => {
        const nextLeads = [...(prev.leads || [])];
        const nextLogs = [...(prev.automationLogs || [])];
        acceptedSecurityDevis.forEach(devis => {
          const client = prev.clients.find(c => c.id === devis.clientId);
          const alreadyOfferedAlarm = prev.documents.some(d => d.clientId === devis.clientId && (d.notes?.includes('CROSS_SELL_ALARM')));
          if (client && !alreadyOfferedAlarm) {
            nextLeads.unshift({
              id: crypto.randomUUID(), name: client.name, phone: client.phone,
              interest: `بيع متقاطع: نظام إنذار ذكي (بعد تركيب كاميرات الفاتورة ${devis.number})`,
              source: 'Direct', status: 'New', priority: 'MEDIUM', createdAt: new Date().toISOString(), conversionProbability: 85
            });
            nextLogs.unshift({
              id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'SMART_CROSS_SELL_TRIGGER', status: 'success',
              details: `تم رصد فرصة بيع نظام إنذار للزبون ${client.name} بناءً على اقتناء سابق للكاميرات.`
            });
            foundOpportunities++;
          }
        });
        return { ...prev, leads: nextLeads, automationLogs: nextLogs };
      });
      setIsScanning(false);
      alert(foundOpportunities > 0 ? `اكتمل المسح: تم العثور على ${foundOpportunities} فرص بيع متقاطع جديدة!` : "اكتمل المسح: لا توجد فرص جديدة حالياً.");
    }, 1000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
             <Workflow className="text-blue-600 animate-pulse" size={32} /> المعالج المركزي الذكي
          </h2>
          <p className="text-slate-500 font-medium">إدارة وتحفيز حلقات الأتمتة المتقدمة في GIM-CORE</p>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={runDebtRecoveryScanner}
             disabled={isDebtScanning}
             className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-3 shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
             {isDebtScanning ? <RefreshCw className="animate-spin" size={18} /> : <HandCoins size={18} />}
             تشغيل نبض تحصيل الديون
          </button>
          <button 
             onClick={runCrossSellScanner}
             disabled={isScanning}
             className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-3 shadow-xl hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
          >
             {isScanning ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
             تشغيل نبض البيع المتقاطع
          </button>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('control')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'control' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
                السيناريوهات
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'logs' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
                السجل التاريخي
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'control' ? (
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                 <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
                    <Cpu size={48} className="text-white" />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">حالة النظام العصبي</h3>
                    <p className="text-blue-300 font-bold text-sm leading-relaxed">
                       النظام يقوم حالياً بتشغيل <span className="text-white px-2 py-0.5 bg-blue-500 rounded-lg">{activeScenarios.length} حلقات منطقية</span>. 
                       تم دمج محرك "التحصيل المتدرج" لضمان استدامة التدفق النقدي للشركة.
                    </p>
                 </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeScenarios.map((s) => (
                <div key={s.id} className={`bg-white rounded-[2.5rem] border-2 ${s.id === 'debt-recovery-loop' ? 'border-red-100 shadow-red-50' : s.id === 'cross-sell-loop' ? 'border-purple-100 shadow-purple-50' : 'border-slate-100'} p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-${s.color}-50 text-${s.color}-600 shadow-inner group-hover:scale-110 transition-transform`}>
                         {s.icon}
                      </div>
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Active Scenario</span>
                      </div>
                   </div>
                   
                   <h4 className="text-xl font-black text-slate-800 mb-2">{s.title}</h4>
                   <p className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest flex items-center gap-2">
                      <Target size={12} /> الأثر: {s.impact}
                   </p>
                   
                   <div className="space-y-4 flex-1">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">المحفز (Trigger)</p>
                         <p className="text-xs font-bold text-slate-700">{s.trigger}</p>
                      </div>
                      <div className={`p-4 rounded-2xl border ${s.id === 'debt-recovery-loop' ? 'bg-red-50 border-red-100' : 'bg-blue-50/30 border-blue-50'}`}>
                         <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${s.id === 'debt-recovery-loop' ? 'text-red-400' : 'text-blue-400'}`}>الإجراء المنطقي</p>
                         <p className={`text-xs font-bold leading-relaxed italic ${s.id === 'debt-recovery-loop' ? 'text-red-800' : 'text-blue-800'}`}>"{s.logic}"</p>
                      </div>
                   </div>

                   <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Protocol: CASH-V2-SECURE</span>
                      <button className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1">
                         تعديل القواعد <ArrowUpRight size={10} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl border-4 border-slate-800 min-h-[600px] flex flex-col relative overflow-hidden text-right">
           <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 relative z-10">
              <h3 className="text-2xl font-black flex items-center gap-3">
                 <Terminal size={24} className="text-green-400" /> سجل النبض اللحظي (Neural Activity)
              </h3>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">GIM-CORE OS Monitor Active &gt;_</div>
           </div>
           
           <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {state.automationLogs && state.automationLogs.length > 0 ? (
                state.automationLogs.map((log) => (
                  <div key={log.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl animate-in slide-in-from-bottom-2 flex gap-4">
                     <div className={`mt-1 ${log.action.includes('RED_FLAG') || log.action.includes('DEBT') ? 'text-red-500' : log.action.includes('CROSS') ? 'text-purple-500' : log.action.includes('PERFORMANCE') ? 'text-amber-500' : 'text-blue-500'}`}>
                        <Zap size={16} />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${log.action.includes('RED_FLAG') ? 'text-red-400' : log.action.includes('CROSS') ? 'text-purple-400' : 'text-blue-400'}`}>{log.action}</span>
                           <span className="text-[9px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-200">{log.details}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-30 py-20">
                   <RefreshCw size={80} className="animate-spin-slow mb-4" />
                   <p className="font-black text-xl uppercase tracking-tighter">بانتظار تنفيذ أول عملية أتمتة...</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default MarketingPage;
