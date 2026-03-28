
import React, { useState } from 'react';
import { AppState, DocType, Visit } from '../types';
import { 
  CheckCircle2, XCircle, ShieldCheck, 
  Camera, ArrowRight, AlertTriangle, 
  Store, ChevronDown, ChevronUp, FileSignature,
  CreditCard, Banknote, Building2, Phone, X
} from 'lucide-react';

interface ClientDecisionProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const ClientDecision: React.FC<ClientDecisionProps> = ({ state, updateState, onNavigate }) => {
  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);
  const [viewState, setViewState] = useState<'REVIEW' | 'REJECT_REASON' | 'SUCCESS_ACCEPTED' | 'SUCCESS_REJECTED'>('REVIEW');
  const [showDetails, setShowDetails] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // 1. Data Retrieval
  const pendingDevis = state.documents.filter(d => d.type === DocType.DEVIS && d.status === 'Sent');
  const selectedDevis = state.documents.find(d => d.id === selectedDevisId);
  
  // Link to Visit/Tech Data
  const linkedVisit = state.visits.find(v => v.linkedDevisId === selectedDevisId) 
                   || state.visits.find(v => v.clientId === selectedDevis?.clientId && v.status === 'Waiting-Approval');
  
  const technician = state.technicians.find(t => t.id === linkedVisit?.technicianId);
  const companyInfo = state.identity;

  // 2. Actions
  const handleApprove = () => {
    if (!termsAccepted) return alert("يرجى الموافقة على شروط الخدمة أولاً.");
    
    updateState(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === selectedDevisId ? { 
        ...d, 
        status: 'Accepted', 
        autoAcceptedAt: new Date().toISOString()
      } : d),
      visits: prev.visits.map(v => v.linkedDevisId === selectedDevisId || v.id === linkedVisit?.id ? {
        ...v,
        phase: 'WORKING', // Move tech to WORKING phase
        status: 'On-Site', 
        proofOfWork: { ...v.proofOfWork, startTime: new Date().toISOString() }
      } : v),
      activityLogs: [
          {
            id: crypto.randomUUID(),
            companyId: 'CMP-GIM-HQ-001',
            deviceId: 'CLIENT-DEVICE',
            version: 1,
            syncStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'CLIENT',
            username: 'Client Portal',
            action: 'CLIENT_ACCEPTED_QUOTE',
            module: 'CLIENT',
            timestamp: new Date().toISOString(),
            details: `الزبون وافق على العرض ${selectedDevis?.number}`,
            severity: 'Info'
          }, 
          ...(prev.activityLogs || [])
      ]
    }));
    setViewState('SUCCESS_ACCEPTED');
  };

  const handleReject = () => {
    if (!rejectReason) return alert("المرجو تحديد سبب الرفض لنتمكن من تحسين خدماتنا.");

    updateState(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === selectedDevisId ? { 
        ...d, 
        status: 'Rejected', 
        rejectionReason: rejectReason 
      } : d),
      visits: prev.visits.map(v => v.linkedDevisId === selectedDevisId || v.id === linkedVisit?.id ? {
        ...v,
        phase: 'DIAGNOSIS_BILLING', // Move tech to BILLING phase (Diag Fee)
        status: 'On-Site'
      } : v),
      activityLogs: [
        {
            id: crypto.randomUUID(),
            companyId: 'CMP-GIM-HQ-001',
            deviceId: 'CLIENT-DEVICE',
            version: 1,
            syncStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'CLIENT',
            username: 'Client Portal',
            action: 'CLIENT_REJECTED_QUOTE',
            module: 'CLIENT',
            timestamp: new Date().toISOString(),
            details: `الزبون رفض العرض. السبب: ${rejectReason}`,
            severity: 'Warning'
        }, 
        ...(prev.activityLogs || [])
      ]
    }));
    setViewState('SUCCESS_REJECTED');
  };

  // --- RENDERERS ---

  if (viewState === 'SUCCESS_ACCEPTED') {
      return (
          <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center p-8 text-white text-center font-arabic animate-in zoom-in">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                  <CheckCircle2 size={64} className="text-green-600" />
              </div>
              <h2 className="text-4xl font-black mb-4">شكراً لثقتكم!</h2>
              <p className="text-xl font-bold opacity-90 mb-8">تم تعميد الطلب بنجاح.</p>
              <div className="bg-green-700/50 p-6 rounded-3xl border border-green-400/30 max-w-sm">
                  <p className="text-sm font-bold">التقني {technician?.name || 'المختص'} سيباشر عملية الإصلاح فوراً.</p>
              </div>
              <button onClick={() => { setSelectedDevisId(null); setViewState('REVIEW'); onNavigate('visits'); }} className="mt-12 bg-white text-green-700 px-8 py-4 rounded-2xl font-black shadow-xl">
                  إغلاق النافذة
              </button>
          </div>
      );
  }

  if (viewState === 'SUCCESS_REJECTED') {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-white text-center font-arabic animate-in zoom-in">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-white/5">
                  <XCircle size={64} className="text-slate-400" />
              </div>
              <h2 className="text-3xl font-black mb-4">تم إلغاء العملية</h2>
              <p className="text-sm font-bold opacity-70 mb-8 max-w-xs mx-auto">نحترم قراركم. المرجو أداء واجب التنقل والتشخيص للتقني لإغلاق الملف.</p>
              <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 w-full max-w-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">المبلغ المستحق (تشخيص)</p>
                  <p className="text-4xl font-black text-amber-500 font-mono">{linkedVisit?.proofOfWork?.diagnosisFee || 150} DH</p>
              </div>
              <button onClick={() => { setSelectedDevisId(null); setViewState('REVIEW'); onNavigate('visits'); }} className="mt-12 text-slate-400 font-bold underline">
                  إغلاق النافذة
              </button>
          </div>
      );
  }

  // --- MAIN LIST VIEW ---
  if (!selectedDevisId) {
      return (
          <div className="min-h-screen bg-slate-50 font-arabic text-right p-6 pt-12" dir="rtl">
              <div className="text-center mb-10">
                  {companyInfo.logo ? (
                      <img src={companyInfo.logo} className="h-16 mx-auto mb-4 object-contain" />
                  ) : (
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white"><Store size={32}/></div>
                  )}
                  <h2 className="text-2xl font-black text-slate-800">بوابة الزبائن</h2>
                  <p className="text-slate-500 text-xs font-bold mt-1">يرجى اختيار الملف للمصادقة</p>
              </div>

              <div className="space-y-4">
                  {pendingDevis.map(doc => (
                      <button key={doc.id} onClick={() => setSelectedDevisId(doc.id)} className="w-full bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group text-right">
                          <div className="flex justify-between items-center mb-2">
                              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">عرض سعر</span>
                              <span className="text-[10px] font-bold text-slate-400">{doc.date}</span>
                          </div>
                          <h3 className="text-lg font-black text-slate-800 mb-1">إصلاح / خدمة تقنية</h3>
                          <p className="text-2xl font-black text-slate-900 font-mono mb-4">{doc.total.toLocaleString()} <span className="text-sm text-slate-400">DH</span></p>
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:underline">
                              <span>مراجعة التفاصيل</span> <ArrowRight size={14} className="rotate-180" />
                          </div>
                      </button>
                  ))}
                  {pendingDevis.length === 0 && (
                      <div className="text-center py-20 opacity-40">
                          <ShieldCheck size={64} className="mx-auto mb-4 text-slate-400" />
                          <p className="font-black text-slate-500">لا توجد ملفات معلقة</p>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- REJECTION MODAL ---
  if (viewState === 'REJECT_REASON') {
      return (
          <div className="fixed inset-0 bg-white z-50 p-8 flex flex-col font-arabic text-right animate-in slide-in-from-bottom-10" dir="rtl">
              <button onClick={() => setViewState('REVIEW')} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-6"><X size={20}/></button>
              <h2 className="text-2xl font-black text-slate-800 mb-2">لماذا تود إلغاء الإصلاح؟</h2>
              <p className="text-slate-500 text-sm font-bold mb-8">رأيك يهمنا لتحسين جودة خدماتنا.</p>
              
              <div className="space-y-3 mb-8">
                  {['السعر مرتفع جداً', 'أريد التفكير في الأمر', 'قررت شراء جهاز جديد', 'سبب آخر'].map(reason => (
                      <button 
                          key={reason}
                          onClick={() => setRejectReason(reason)}
                          className={`w-full p-4 rounded-2xl text-right font-bold text-sm border-2 transition-all ${rejectReason === reason ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white text-slate-600'}`}
                      >
                          {reason}
                      </button>
                  ))}
              </div>

              <div className="mt-auto bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">مصاريف التشخيص الواجب أداؤها</p>
                  <p className="text-3xl font-black text-slate-800">{linkedVisit?.proofOfWork?.diagnosisFee || 150} DH</p>
              </div>

              <button 
                  onClick={handleReject}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-black shadow-xl text-lg hover:bg-red-700 transition-all"
              >
                  تأكيد الرفض والإلغاء
              </button>
          </div>
      );
  }

  // --- MAIN QUOTE VIEW (Contract) ---
  return (
      <div className="min-h-screen bg-slate-50 font-arabic text-right pb-32 relative" dir="rtl">
          
          {/* Company Branding Header */}
          <div className="bg-white p-6 pb-12 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                  <div>
                      <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{companyInfo.companyName || 'GIM SERVICES'}</h1>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Phone size={10}/> {companyInfo.phone}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="flex items-center gap-1"><Building2 size={10}/> {companyInfo.city || 'Maroc'}</span>
                      </div>
                  </div>
                  <button onClick={() => setSelectedDevisId(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={18} /></button>
              </div>
          </div>

          <div className="p-6 -mt-6 space-y-6 relative z-0">
              
              {/* 1. Problem Evidence (The Hook) */}
              <div className="bg-white p-2 rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden">
                  <div className="relative h-64 rounded-[2rem] overflow-hidden bg-slate-900 group">
                      {linkedVisit?.proofOfWork?.photoBefore ? (
                          <img src={linkedVisit.proofOfWork.photoBefore} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-500">
                              <Camera size={48} className="mb-2 opacity-50"/>
                              <span className="text-xs font-bold">لا توجد صورة للعطل</span>
                          </div>
                      )}
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <AlertTriangle size={12} /> المشكلة المشخصة
                      </div>
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-12">
                          <p className="text-white text-sm font-bold leading-relaxed line-clamp-2">
                              {linkedVisit?.proofOfWork?.technicianNotes || "تشخيص تقني شامل للجهاز."}
                          </p>
                      </div>
                  </div>
              </div>

              {/* 2. The Offer (Accordion Style) */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div 
                      className="p-6 flex justify-between items-center cursor-pointer bg-slate-50/50"
                      onClick={() => setShowDetails(!showDetails)}
                  >
                      <h3 className="font-black text-slate-800 flex items-center gap-2">
                          <ShieldCheck size={20} className="text-blue-600" /> الحل المقترح والتكلفة
                      </h3>
                      {showDetails ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                  </div>
                  
                  {showDetails && (
                      <div className="p-6 pt-0 space-y-4 animate-in slide-in-from-top-2">
                          <div className="space-y-3">
                              {selectedDevis?.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0">
                                      <span className="font-bold text-slate-600">{item.description} <span className="text-[10px] text-slate-400">x{item.quantity}</span></span>
                                      <span className="font-black text-slate-800">{item.total} DH</span>
                                  </div>
                              ))}
                          </div>
                          <div className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center shadow-lg">
                              <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase">المجموع النهائي</p>
                                  <p className="text-xs text-slate-500">شامل الضريبة واليد العاملة</p>
                              </div>
                              <p className="text-3xl font-black font-mono tracking-tighter">{selectedDevis?.total} <span className="text-sm text-slate-400">DH</span></p>
                          </div>
                      </div>
                  )}
              </div>

              {/* 3. Warranty & Terms */}
              <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex gap-4 items-start">
                  <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm shrink-0"><ShieldCheck size={20} /></div>
                  <div>
                      <h4 className="font-black text-blue-900 text-sm mb-1">ضمان الجودة</h4>
                      <p className="text-xs font-bold text-blue-700/80 leading-relaxed">
                          هذا الإصلاح مضمون لمدة 3 أشهر. الضمان يشمل قطع الغيار المستبدلة واليد العاملة.
                      </p>
                  </div>
              </div>

              {/* 4. Terms Acceptance Checkbox */}
              <div className="px-2">
                  <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                          {termsAccepted && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors select-none">
                          أوافق على الإصلاح وعلى <span className="underline text-blue-600">الشروط العامة للخدمة</span>.
                      </span>
                  </label>
              </div>

          </div>

          {/* Sticky Footer Actions */}
          <div className="fixed bottom-0 w-full bg-white border-t border-slate-100 p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
              <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                  <button 
                      onClick={() => setViewState('REJECT_REASON')}
                      className="bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                      رفض العرض
                  </button>
                  <button 
                      onClick={handleApprove}
                      disabled={!termsAccepted}
                      className={`py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                          termsAccepted 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                  >
                      <FileSignature size={18} /> موافقة وبدء العمل
                  </button>
              </div>
          </div>

      </div>
  );
};

export default ClientDecision;
