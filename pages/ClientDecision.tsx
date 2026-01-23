
import React, { useState } from 'react';
import { AppState, Document, DocType, Client, AutonomousDecision, Visit } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  MessageSquare, 
  Zap, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Building2,
  AlertTriangle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Bell
} from 'lucide-react';

interface ClientDecisionProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const ClientDecision: React.FC<ClientDecisionProps> = ({ state, updateState, onNavigate }) => {
  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // جلب عروض الأثمان التي تنتظر الرد (Sent)
  const pendingDevis = state.documents.filter(d => d.type === DocType.DEVIS && d.status === 'Sent');
  const selectedDevis = state.documents.find(d => d.id === selectedDevisId);
  const client = state.clients.find(c => c.id === selectedDevis?.clientId);

  const handleDecision = (decision: 'Accepted' | 'Rejected') => {
    if (!selectedDevisId) return;

    const actionTaken = decision === 'Accepted' 
      ? `الموافقة على عرض الثمن ${selectedDevis?.number} وفك تجميد التقني`
      : `رفض عرض الثمن ${selectedDevis?.number} - السبب: ${rejectionReason}`;

    const newAutoDecision: AutonomousDecision = {
      id: crypto.randomUUID(),
      triggerEvent: 'CLIENT_PORTAL_FEEDBACK',
      actionTaken,
      confidenceScore: 100,
      logicPath: 'CLIENT_ACTION -> UPDATE_DOC -> UNFREEZE_TECH -> NOTIFY_MOBILE_APP',
      timestamp: new Date().toISOString(),
      status: 'Executed'
    };

    updateState(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === selectedDevisId ? { 
        ...d, 
        status: decision, 
        rejectionReason: decision === 'Rejected' ? rejectionReason : undefined,
        autoAcceptedAt: decision === 'Accepted' ? new Date().toISOString() : undefined
      } : d),
      // فك تجميد الزيارة الميدانية أو إلغاؤها
      visits: prev.visits.map(v => v.linkedDevisId === selectedDevisId ? {
        ...v,
        status: decision === 'Accepted' ? 'On-Site' : 'Cancelled'
      } : v),
      autonomousDecisions: [newAutoDecision, ...(prev.autonomousDecisions || [])],
      automationLogs: [{
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: decision === 'Accepted' ? 'TECH_UNFROZEN_BY_CLIENT' : 'TASK_CANCELLED_BY_CLIENT',
        status: 'success',
        details: `الزبون ${client?.name} ${decision === 'Accepted' ? 'قبل' : 'رفض'} العرض. تم تحديث رادار التقني.`
      }, ...(prev.automationLogs || [])]
    }));

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedDevisId(null);
      setShowRejectionForm(false);
    }, 3000);
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-700 pb-24 text-right bg-slate-50 min-h-screen font-arabic" dir="rtl">
      
      {!selectedDevisId ? (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl text-white animate-bounce">
                <ShieldCheck size={40} />
             </div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tighter">بوابة قرارات الزبناء (GIM-Consent)</h2>
             <p className="text-slate-500 font-bold">يرجى مراجعة العروض التقنية المعروضة واتخاذ قرار البدء.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {pendingDevis.length > 0 ? pendingDevis.map(devis => {
                const devisClient = state.clients.find(c => c.id === devis.clientId);
                return (
                   <button 
                     key={devis.id}
                     onClick={() => setSelectedDevisId(devis.id)}
                     className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] text-right hover:border-blue-500 hover:shadow-2xl transition-all group relative overflow-hidden"
                   >
                      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start mb-6">
                         <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><FileText size={24}/></div>
                         <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase">عرض جديد بانتظاركم</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-1">{devisClient?.name}</h3>
                      <p className="text-xs font-bold text-slate-400 font-mono mb-6">{devis.number}</p>
                      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                         <span className="text-[10px] font-black text-slate-400 uppercase">المبلغ الإجمالي</span>
                         <span className="text-2xl font-black text-blue-600 font-mono">{devis.total.toLocaleString()} DH</span>
                      </div>
                   </button>
                );
             }) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 opacity-50">
                   <Clock size={80} className="mx-auto text-slate-200 mb-4" />
                   <p className="text-slate-400 font-black text-xl">لا توجد عروض تنتظر القرار حالياً.</p>
                </div>
             )}
          </div>
        </div>
      ) : isSuccess ? (
        <div className="max-w-md mx-auto text-center py-20 space-y-6 animate-in zoom-in duration-500">
           <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl text-white">
              <CheckCircle2 size={64} />
           </div>
           <h3 className="text-3xl font-black text-slate-800">تم تسجيل قراركم بنجاح</h3>
           <p className="text-slate-500 font-bold leading-relaxed">شكراً لتعاونكم. سيقوم النظام آلياً بتوجيه الطاقم التقني لمباشرة العمل بناءً على قراركم القابل للتنفيذ الفوري.</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10">
           <button onClick={() => setSelectedDevisId(null)} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase hover:text-blue-600 transition-colors">
              <ArrowLeft size={16} className="rotate-180" /> العودة للقائمة
           </button>

           <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">مراجعة العرض التقني والمالي</p>
                    <h2 className="text-3xl font-black tracking-tighter">السيد(ة) {client?.name}</h2>
                    <p className="text-slate-400 text-sm font-bold mt-2">المرجع: {selectedDevis?.number} (التقني ينتظر موافقتكم في الموقع)</p>
                 </div>
                 <Bell className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 animate-pulse" />
              </div>

              <div className="p-10 space-y-10">
                 <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 space-y-6">
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={16} /> تفاصيل الإصلاح المبرمج
                    </h4>
                    <div className="space-y-4">
                       {selectedDevis?.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center border-b border-blue-100/50 pb-4">
                             <div>
                                <p className="font-black text-slate-800 text-sm">{item.description}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">الكمية: {item.quantity}</p>
                             </div>
                             <span className="font-black text-blue-600 font-mono">{item.total.toLocaleString()} DH</span>
                          </div>
                       ))}
                    </div>
                    <div className="pt-4 flex justify-between items-end">
                       <p className="text-[10px] font-black text-slate-400 uppercase">المبلغ الإجمالي النهائي (TTC)</p>
                       <p className="text-4xl font-black text-slate-900 font-mono tracking-tighter">{selectedDevis?.total.toLocaleString()} <span className="text-lg">DH</span></p>
                    </div>
                 </div>

                 {!showRejectionForm ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <button 
                         onClick={() => handleDecision('Accepted')}
                         className="bg-green-600 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                       >
                          <ThumbsUp size={48} />
                          <div>
                             <p className="text-xl font-black">أوافق، ابدأ العمل فوراً</p>
                             <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">Authorize deployment now</p>
                          </div>
                       </button>
                       <button 
                         onClick={() => setShowRejectionForm(true)}
                         className="bg-white border-4 border-red-100 text-red-600 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-red-500 hover:bg-red-50 transition-all active:scale-95"
                       >
                          <ThumbsDown size={48} />
                          <div>
                             <p className="text-xl font-black">أرفض، لا أريد الإصلاح</p>
                             <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">Decline and stop mission</p>
                          </div>
                       </button>
                    </div>
                 ) : (
                    <div className="bg-red-50 p-8 rounded-[3rem] border border-red-100 space-y-6 animate-in slide-in-from-top-6">
                       <div className="flex items-center gap-3 text-red-600">
                          <AlertTriangle size={24} />
                          <h4 className="text-lg font-black uppercase">يرجى توضيح سبب الرفض لإخبار التقني</h4>
                       </div>
                       <textarea 
                         required
                         placeholder="أدخل سبب الرفض هنا..."
                         className="w-full bg-white border-2 border-red-100 rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-red-500/10 outline-none h-32 resize-none"
                         value={rejectionReason}
                         onChange={e => setRejectionReason(e.target.value)}
                       />
                       <div className="flex gap-4">
                          <button 
                             onClick={() => handleDecision('Rejected')}
                             className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg uppercase text-xs"
                          >
                             <Send size={18} /> تأكيد الرفض النهائي
                          </button>
                          <button 
                             onClick={() => setShowRejectionForm(false)}
                             className="px-10 bg-white text-slate-400 font-black py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all uppercase text-xs"
                          >
                             إلغاء
                          </button>
                       </div>
                    </div>
                 )}
              </div>
              
              <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    هذا العرض ملزم قانونياً لشركة {state.settings.name} لمدة 15 يوماً من تاريخ الإصدار.<br/>
                    عند الضغط على موافقة، سيتم إخطار التقني المتواجد لديكم بالبدء فوراً.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClientDecision;
