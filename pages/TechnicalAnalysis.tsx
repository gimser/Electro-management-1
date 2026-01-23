
import React, { useState } from 'react';
import { AppState, CustomerIssue, TechnicalDiagnosis, InventoryItem, DocType, Document, LineItem, AutonomousDecision, Visit, ServicePrice } from '../types';
import { 
  Stethoscope, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  User, 
  History,
  FileSearch,
  Zap,
  ClipboardCheck,
  UserCheck,
  Calendar,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  MessageSquare,
  Microscope,
  Package,
  Plus,
  X,
  Box,
  Send,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateDocNumber } from '../db';

interface TechnicalAnalysisProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ state, updateState }) => {
  const { user } = useAuth();
  const isAdminOrManager = ['SuperAdmin', 'Manager', 'Office'].includes(user?.role || '');
  
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [isProcessingAutoDevis, setIsProcessingAutoDevis] = useState(false);
  
  const [formData, setFormData] = useState<TechnicalDiagnosis>({
    symptoms: '',
    rootCause: '',
    recommendation: '',
    diagnosedBy: user?.fullName || '',
    date: new Date().toISOString().split('T')[0]
  });

  const allIssues = state.customerIssues || [];
  const pendingIssues = allIssues.filter(iss => 
    iss.status === 'Open' || iss.status === 'Assigned' || iss.status === 'In-Progress'
  );

  const diagnosedIssues = allIssues.filter(iss => 
    iss.status === 'Diagnosed' || (iss.diagnosis && iss.status !== 'Resolved')
  );

  const selectedIssue = allIssues.find(iss => iss.id === selectedIssueId);
  const isAlreadyDiagnosed = !!selectedIssue?.diagnosis;

  const filteredInventory = state.inventory.filter(item => 
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    item.sku?.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const handleSelectItem = (item: InventoryItem) => {
    // تنسيق خاص لكي يتعرف عليه المحرك الآلي لاحقاً
    const itemText = `\n- [ITEM] ${item.name} (REF: ${item.sku || 'N/A'})`;
    setFormData(prev => ({
      ...prev,
      recommendation: prev.recommendation + itemText
    }));
    setShowInventoryPicker(false);
  };

  // --- محرك الأتمتة المتقدم: تحليل البنود وتوليد Devis تفصيلي ---
  const triggerAutonomousFlow = (issue: CustomerIssue, diagnosis: TechnicalDiagnosis) => {
    setIsProcessingAutoDevis(true);
    
    const client = state.clients.find(c => c.id === issue.clientId);
    const devisCount = state.documents.filter(d => d.type === DocType.DEVIS).length;
    
    const autoItems: LineItem[] = [];

    // 1. البحث عن الخدمة المناسبة (Labor) من فهرس الخدمات بناءً على تصنيف المشكلة
    const matchedService = state.servicePrices.find(s => s.category === issue.category) || 
                          state.servicePrices.find(s => s.category === 'Security & Networks');

    if (matchedService) {
      autoItems.push({
        id: crypto.randomUUID(),
        description: `خدمة تقنية: ${matchedService.serviceName} - ${issue.title}`,
        quantity: 1,
        unitPrice: matchedService.price,
        total: matchedService.price
      });
    }

    // 2. استخراج المنتجات المذكورة في التوصية ومطابقتها مع المخزن
    state.inventory.forEach(invItem => {
      // إذا كان اسم المنتج أو SKU مذكوراً في نص التوصية
      if (diagnosis.recommendation.includes(invItem.name) || (invItem.sku && diagnosis.recommendation.includes(invItem.sku))) {
        autoItems.push({
          id: crypto.randomUUID(),
          inventoryId: invItem.id,
          description: `${invItem.name} (${invItem.sku || 'N/A'})`,
          quantity: 1, // نفترض قطعة واحدة لكل منتج تم ذكره، يمكن تعديله يدوياً لاحقاً
          unitPrice: invItem.sellingPrice,
          total: invItem.sellingPrice
        });
      }
    });

    // 3. حساب المجاميع
    const subtotal = autoItems.reduce((acc, curr) => acc + curr.total, 0);

    const autoDevis: Document = {
      id: crypto.randomUUID(),
      clientId: issue.clientId,
      type: DocType.DEVIS,
      number: generateDocNumber(DocType.DEVIS, devisCount),
      date: new Date().toISOString().split('T')[0],
      items: autoItems,
      subtotal,
      tva: 20,
      total: subtotal * 1.2,
      status: 'Sent',
      notes: `عرض ثمن تفصيلي (قطع غيار + يد عاملة) مولد بناءً على التشخيص الميداني.\nالتشخيص: ${diagnosis.rootCause}`,
      autoAcceptedAt: undefined
    };

    const autonomousDecision: AutonomousDecision = {
      id: crypto.randomUUID(),
      triggerEvent: 'DETAILED_DIAGNOSIS_RECEIVED',
      actionTaken: `توليد عرض ثمن تفصيلي ${autoDevis.number} يحتوي على ${autoItems.length} بنود`,
      confidenceScore: 99,
      logicPath: 'MATCH_SERVICE_BY_CAT -> EXTRACT_ITEMS_FROM_TEXT -> COMPOSE_DEVIS',
      timestamp: new Date().toISOString(),
      status: 'Executed'
    };

    setTimeout(() => {
      updateState(prev => ({
        ...prev,
        documents: [...prev.documents, autoDevis],
        autonomousDecisions: [autonomousDecision, ...(prev.autonomousDecisions || [])],
        visits: prev.visits.map(v => v.taskId === issue.taskId ? { 
          ...v, 
          status: 'Waiting-Approval', 
          linkedDevisId: autoDevis.id 
        } : v),
        automationLogs: [{
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action: 'DETAILED_AUTO_DEVIS',
          status: 'success',
          details: `تم إصدار عرض ثمن تفصيلي رقم ${autoDevis.number} للزبون ${client?.name}.`
        }, ...(prev.automationLogs || [])]
      }));
      setIsProcessingAutoDevis(false);
      
      const msg = `السلام عليكم ${client?.name},\n\nتجدون رفقته تفاصيل عرض الثمن رقم *${autoDevis.number}* لإصلاح العطل المكتشف.\n\nالمكونات والخدمات:\n${autoItems.map(item => `- ${item.description}: ${item.total} DH`).join('\n')}\n\nالإجمالي: *${autoDevis.total.toLocaleString()} DH*\n\nيرجى الموافقة لبدء العمل: [رابط الموافقة]`;
      window.open(`https://wa.me/${client?.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      
      alert('تم توليد عرض ثمن مفصل (سلع + خدمات) وإرساله للزبون بنجاح.');
      setSelectedIssueId(null);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || !selectedIssue) return;

    const updatedDiagnosis = { ...formData, date: new Date().toISOString().split('T')[0] };

    updateState(prev => ({
      ...prev,
      customerIssues: prev.customerIssues.map(iss => 
        iss.id === selectedIssueId 
          ? { ...iss, status: 'Diagnosed', diagnosis: updatedDiagnosis } 
          : iss
      )
    }));

    triggerAutonomousFlow(selectedIssue, updatedDiagnosis);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4 tracking-tighter">
             <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Stethoscope size={30} />
             </div>
             <div>
                {isAdminOrManager ? 'مركز التدقيق والمراجعة التقنية' : 'نظام التشخيص الفني الميداني'}
                <p className="text-slate-500 font-bold text-sm tracking-normal mt-1 italic">مزامنة البيانات بين الميدان ومركز القرار</p>
             </div>
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-blue-900 text-white px-6 py-3 rounded-2xl shadow-xl animate-pulse">
           <Zap size={18} className="text-amber-400 fill-amber-400" />
           <span className="text-[10px] font-black uppercase tracking-widest">محرك مطابقة السلع والخدمات نشط</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pr-2">
                 <Zap size={14} className="text-amber-500 fill-amber-500" /> أعطال بانتظار الفحص ({pendingIssues.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pl-2">
                 {pendingIssues.length > 0 ? pendingIssues.map(issue => (
                    <button 
                       key={issue.id}
                       onClick={() => { setSelectedIssueId(issue.id); setFormData({ ...formData, recommendation: '', symptoms: '', rootCause: '', diagnosedBy: user?.fullName || '' }); }}
                       className={`w-full text-right p-5 rounded-[1.5rem] border-2 transition-all relative overflow-hidden group ${selectedIssueId === issue.id && !isAlreadyDiagnosed ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                       <div className="relative z-10">
                          <h4 className="font-black text-slate-800 text-xs mb-1 group-hover:text-blue-600 transition-colors">{issue.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{state.clients.find(c => c.id === issue.clientId)?.name}</p>
                       </div>
                    </button>
                 )) : (
                    <p className="text-[10px] text-slate-300 italic pr-2">لا توجد بلاغات معلقة حالياً.</p>
                 )}
              </div>
           </div>

           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pr-2 border-t border-slate-100 pt-4">
                 <ShieldCheck size={14} className="text-green-500" /> تقارير المراجعة ({diagnosedIssues.length})
              </h3>
              <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pl-2">
                 {diagnosedIssues.slice().reverse().map(issue => (
                    <button 
                       key={issue.id}
                       onClick={() => setSelectedIssueId(issue.id)}
                       className={`w-full text-right p-5 rounded-[1.5rem] border-2 transition-all relative overflow-hidden group ${selectedIssueId === issue.id && isAlreadyDiagnosed ? 'border-green-600 bg-green-50 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                       <div className="flex justify-between items-center mb-1">
                          <h4 className="font-black text-slate-800 text-xs">{issue.title}</h4>
                          <span className="text-[8px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-lg uppercase">مكتمل</span>
                       </div>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">{state.clients.find(c => c.id === issue.clientId)?.name}</p>
                       <p className="text-[8px] text-blue-500 font-black mt-2">بواسطة: {issue.diagnosis?.diagnosedBy}</p>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
           {!selectedIssue ? (
              <div className="h-[600px] flex flex-col items-center justify-center text-slate-300 space-y-6 border-4 border-dashed border-slate-100 rounded-[4rem] bg-white/50">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                    <FileSearch size={48} className="stroke-1 text-slate-200" />
                 </div>
                 <div className="text-center">
                    <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">بانتظار اختيار تذكرة</h4>
                    <p className="text-sm font-bold text-slate-300 mt-2">اختر حالة من القائمة الجانبية لبدء الفحص.</p>
                 </div>
              </div>
           ) : isAlreadyDiagnosed ? (
              <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-left-6 duration-500">
                 <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="bg-green-500 p-2 rounded-lg"><CheckCircle2 size={18} /></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400">تقرير تقني معتمد</span>
                       </div>
                       <h3 className="text-3xl font-black tracking-tight">{selectedIssue.title}</h3>
                       <p className="text-slate-400 text-xs font-bold mt-2 flex items-center gap-2">
                          <User size={14} className="text-blue-400" /> الزبون: {state.clients.find(c => c.id === selectedIssue.clientId)?.name}
                       </p>
                    </div>
                    <div className="relative z-10 text-left">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رقم التقرير</p>
                       <p className="font-mono font-black text-2xl text-blue-400">#{selectedIssue.id.slice(0,8).toUpperCase()}</p>
                    </div>
                    <Zap className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
                 </div>

                 <div className="p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10 border-b border-slate-100">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><UserCheck size={28}/></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الخبير المشخص</p>
                             <p className="text-lg font-black text-slate-800">{selectedIssue.diagnosis?.diagnosedBy}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner"><Calendar size={28}/></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ الفحص</p>
                             <p className="text-lg font-black text-slate-800">{selectedIssue.diagnosis?.date}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                          <div className="flex items-center gap-3 text-slate-800 border-r-4 border-blue-600 pr-4">
                             <FileText size={20} className="text-blue-600" />
                             <h4 className="text-sm font-black uppercase tracking-widest">الأعراض المرصودة</h4>
                          </div>
                          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                             <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedIssue.diagnosis?.symptoms}"</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-red-600 border-r-4 border-red-600 pr-4">
                                <AlertTriangle size={20} />
                                <h4 className="text-sm font-black uppercase tracking-widest">السبب الجذري</h4>
                             </div>
                             <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100">
                                <p className="text-sm font-black text-red-800 leading-relaxed italic">"{selectedIssue.diagnosis?.rootCause}"</p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-green-600 border-r-4 border-green-600 pr-4">
                                <Zap size={20} />
                                <h4 className="text-sm font-black uppercase tracking-widest">التوصية النهائية</h4>
                             </div>
                             <div className="bg-green-50/50 p-8 rounded-[2rem] border border-green-100">
                                <p className="text-sm font-black text-green-900 leading-relaxed italic whitespace-pre-wrap">"{selectedIssue.diagnosis?.recommendation}"</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-left-6 duration-500">
                 <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">تحرير تشخيص جديد</span>
                       </div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{selectedIssue.title}</h3>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                       <div className="text-left">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Ticket ID</p>
                          <p className="text-xs font-black text-slate-800 font-mono">#{selectedIssue.id.slice(0,6)}</p>
                       </div>
                    </div>
                 </div>

                 <form onSubmit={handleSubmit} className="p-12 space-y-8">
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2 flex items-center gap-2">
                             <Microscope size={14} className="text-blue-600" /> الأعراض التقنية الملاحظة
                          </label>
                          <textarea 
                             required 
                             placeholder="اكتب بالتفصيل حالة الجهاز..."
                             className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-bold text-slate-700 h-32 resize-none transition-all shadow-inner"
                             value={formData.symptoms}
                             onChange={e => setFormData({...formData, symptoms: e.target.value})}
                          />
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mr-2 flex items-center gap-2">
                                <AlertCircle size={14} /> السبب الجذري للعطل
                             </label>
                             <textarea 
                                required 
                                placeholder="لماذا تعطل النظام؟"
                                className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none font-bold text-slate-700 h-32 resize-none transition-all shadow-inner"
                                value={formData.rootCause}
                                onChange={e => setFormData({...formData, rootCause: e.target.value})}
                             />
                          </div>

                          <div className="space-y-4">
                             <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-black text-green-600 uppercase tracking-widest mr-2 flex items-center gap-2">
                                   <Zap size={14} /> التوصية النهائية (الحل)
                                </label>
                                <button 
                                   type="button"
                                   onClick={() => setShowInventoryPicker(true)}
                                   className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
                                >
                                   <Package size={12} /> استيراد من المخزن
                                </button>
                             </div>
                             <textarea 
                                required 
                                placeholder="ما هي الخطوات والقطع المطلوبة؟ (استخدم زر الاستيراد للربط التلقائي)"
                                className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none font-bold text-slate-700 h-32 resize-none transition-all shadow-inner"
                                value={formData.recommendation}
                                onChange={e => setFormData({...formData, recommendation: e.target.value})}
                             />
                          </div>
                       </div>
                    </div>

                    <button 
                       type="submit" 
                       disabled={isProcessingAutoDevis}
                       className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-blue-600 transition-all uppercase tracking-[0.2em] text-sm mt-6 flex items-center justify-center gap-4 group disabled:opacity-50"
                    >
                       {isProcessingAutoDevis ? <Loader2 size={24} className="animate-spin" /> : <ClipboardCheck size={24} />}
                       {isProcessingAutoDevis ? 'جاري مطابقة المخزن وتوليد العرض...' : 'اعتماد التشخيص وتوليد عرض ثمن تفصيلي'}
                    </button>
                 </form>
              </div>
           )}
        </div>
      </div>

      {/* Inventory Picker Modal for Diagnosis */}
      {showInventoryPicker && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-xl h-[70vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <Box size={24} className="text-blue-400" />
                     <h3 className="text-xl font-black uppercase">اختيار قطع غيار مطلوبة</h3>
                  </div>
                  <button onClick={() => setShowInventoryPicker(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
               </div>
               <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <div className="relative">
                     <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
                     <input 
                        className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none" 
                        placeholder="ابحث بالاسم أو SKU..."
                        value={inventorySearch}
                        onChange={e => setInventorySearch(e.target.value)}
                        autoFocus
                     />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {filteredInventory.map(item => (
                     <button key={item.id} onClick={() => handleSelectItem(item)} className="w-full text-right p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                              <Package size={18} />
                           </div>
                           <div>
                              <p className="font-black text-slate-800">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">متاح: {item.quantity} {item.unit}</p>
                           </div>
                        </div>
                        <div className="text-left flex flex-col items-end">
                           <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase font-mono">{item.sku || 'N/A'}</span>
                           <Plus size={16} className="text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TechnicalAnalysis;
