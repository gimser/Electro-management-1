
import React, { useState } from 'react';
import { AppState, TechnicalDiagnosis, InventoryItem } from '../types';
import { 
  Stethoscope, 
  FileSearch,
  ClipboardCheck,
  Package,
  X,
  Loader2,
  Plus,
  Trash2,
  Search,
  Box,
  ShoppingCart,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Save,
  Microscope,
  Cpu,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createRecord } from '../db';

interface TechnicalAnalysisProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ state, updateState }) => {
  const { user } = useAuth();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Inventory Picker State
  const [showPartPicker, setShowPartPicker] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  
  const [formData, setFormData] = useState<TechnicalDiagnosis>({
    symptoms: '',
    rootCause: '',
    recommendation: '',
    diagnosedBy: user?.fullName || '',
    date: new Date().toISOString().split('T')[0],
    requiredParts: []
  });

  const pendingIssues = (state.customerIssues || []).filter(iss => iss.status === 'Open' || iss.status === 'Assigned' || iss.status === 'In-Progress');
  const selectedIssue = (state.customerIssues || []).find(iss => iss.id === selectedIssueId);
  const client = state.clients.find(c => c.id === selectedIssue?.clientId);

  // Filter Inventory based on search
  const filteredInventory = state.inventory.filter(item => 
    item.name.toLowerCase().includes(partSearch.toLowerCase()) || 
    item.sku?.toLowerCase().includes(partSearch.toLowerCase())
  );

  // --- ACTIONS ---

  const handleAddPart = (item: InventoryItem) => {
    const existingPart = formData.requiredParts?.find(p => p.inventoryId === item.id);
    let updatedParts;
    
    if (existingPart) {
      updatedParts = formData.requiredParts?.map(p => 
        p.inventoryId === item.id ? { ...p, quantity: p.quantity + 1 } : p
      );
    } else {
      updatedParts = [
        ...(formData.requiredParts || []), 
        { inventoryId: item.id, name: item.name, quantity: 1, price: item.sellingPrice }
      ];
    }
    
    setFormData(prev => ({ ...prev, requiredParts: updatedParts }));
    // Do not close picker immediately to allow multiple adds
    // setShowPartPicker(false); 
  };

  const handleUpdatePartQty = (inventoryId: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      requiredParts: prev.requiredParts?.map(p => {
        if (p.inventoryId === inventoryId) {
          const newQty = Math.max(1, p.quantity + delta);
          return { ...p, quantity: newQty };
        }
        return p;
      })
    }));
  };

  const handleRemovePart = (inventoryId: string) => {
    setFormData(prev => ({
      ...prev,
      requiredParts: prev.requiredParts?.filter(p => p.inventoryId !== inventoryId)
    }));
  };

  const estimatedPartsCost = formData.requiredParts?.reduce((acc, p) => acc + (p.price * p.quantity), 0) || 0;

  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || !selectedIssue) return;
    setIsProcessing(true);

    setTimeout(() => {
      updateState(prev => ({
        ...prev,
        customerIssues: prev.customerIssues.map(iss => iss.id === selectedIssueId ? { ...iss, status: 'Diagnosed', diagnosis: formData } : iss),
        activityLogs: [createRecord({
          userId: user?.id || 'tech',
          username: user?.fullName || 'Tech',
          action: 'MANUAL_DIAGNOSIS_LOGGED',
          module: 'TECHNICAL',
          timestamp: new Date().toISOString(),
          details: `تم تسجيل تشخيص فني للمشكلة: ${selectedIssue.title}. قطع الغيار: ${formData.requiredParts?.length || 0}`,
          severity: 'Info'
        }), ...(prev.activityLogs || [])]
      }));

      setIsProcessing(false);
      alert('✅ تم حفظ تقرير التشخيص وقائمة القطع اللازمة بنجاح.');
      setSelectedIssueId(null);
      setFormData({
        symptoms: '', rootCause: '', recommendation: '', 
        diagnosedBy: user?.fullName || '', date: new Date().toISOString().split('T')[0], requiredParts: [] 
      });
    }, 800);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right font-arabic h-[calc(100vh-80px)] flex flex-col" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4 tracking-tighter">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Microscope size={30} />
            </div>
            المختبر والتشخيص الدقيق
            </h2>
            <p className="text-slate-500 font-bold text-xs mt-2 mr-20">تحليل الأعطال وتحديد قطع الغيار اللازمة للإصلاح</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-lg"><AlertCircle size={20}/></div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">قيد الانتظار</p>
                    <p className="text-xl font-black text-slate-800">{pendingIssues.length}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        
        {/* Sidebar: Ticket List */}
        <div className="w-1/3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
           <div className="p-6 border-b border-slate-50 bg-slate-50">
               <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                   <ClipboardCheck size={16}/> التذاكر المفتوحة
               </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {pendingIssues.length > 0 ? pendingIssues.map(issue => (
                  <button 
                    key={issue.id} 
                    onClick={() => { setSelectedIssueId(issue.id); setFormData(prev => ({...prev, requiredParts: []})); }} 
                    className={`w-full text-right p-5 rounded-2xl border-2 transition-all group relative overflow-hidden ${selectedIssueId === issue.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200 bg-white'}`}
                  >
                     <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${issue.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {issue.priority} Priority
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                     </div>
                     <h4 className="font-black text-slate-800 text-sm mb-1 relative z-10 line-clamp-1">{issue.title}</h4>
                     <p className="text-[10px] text-slate-500 font-bold uppercase relative z-10">{state.clients.find(c => c.id === issue.clientId)?.name}</p>
                     
                     {/* Hover Effect */}
                     <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                  </button>
               )) : (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                       <CheckCircle2 size={48} className="mb-4" />
                       <p className="font-black text-xs uppercase">لا توجد تذاكر معلقة</p>
                   </div>
               )}
           </div>
        </div>

        {/* Main Content: Diagnosis Form */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
           {!selectedIssue ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                 <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Stethoscope size={64} className="text-slate-200" />
                 </div>
                 <p className="font-black uppercase text-lg">اختر تذكرة لبدء عملية التشخيص</p>
                 <p className="text-xs font-bold mt-2">سيتم تسجيل النتائج وربطها بملف الزبون</p>
              </div>
           ) : (
              <div className="flex flex-col h-full">
                 {/* Ticket Header */}
                 <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-2xl font-black text-slate-800">{selectedIssue.title}</h3>
                           <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded">Q-{selectedIssue.id.substring(0,4)}</span>
                       </div>
                       <p className="text-slate-500 text-xs font-bold flex items-center gap-2">
                           <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">{client?.name}</span>
                           <span>•</span>
                           <span className="italic">{selectedIssue.description}</span>
                       </p>
                    </div>
                    {isProcessing && <Loader2 size={24} className="text-blue-600 animate-spin" />}
                 </div>
                 
                 {/* Scrollable Form */}
                 <form onSubmit={handleDiagnose} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    
                    {/* 1. Technical Findings */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
                            <FileSearch size={18} className="text-blue-500"/> 1. تقرير الفحص (Technical Findings)
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">الأعراض المرصودة (Symptoms)</label>
                                <textarea required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="مثال: ارتفاع حرارة، ضجيج في المروحة..." value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">السبب الجذري (Root Cause)</label>
                                <textarea required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="مثال: تلف المعجون الحراري وتراكم الغبار..." value={formData.rootCause} onChange={e => setFormData({...formData, rootCause: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase">التوصيات والإصلاح المقترح</label>
                            <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: تنظيف شامل + تغيير المعجون الحراري + استبدال المروحة" value={formData.recommendation} onChange={e => setFormData({...formData, recommendation: e.target.value})} />
                        </div>
                    </div>

                    {/* 2. Spare Parts (Inventory Integration) */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                                <Cpu size={18} className="text-amber-500"/> 2. قطع الغيار والمواد (Spare Parts)
                            </h4>
                            <button type="button" onClick={() => setShowPartPicker(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg">
                                <Plus size={14} /> إضافة من المخزن
                            </button>
                        </div>

                        {formData.requiredParts && formData.requiredParts.length > 0 ? (
                            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase">
                                            <th className="px-4 py-3">القطعة / المادة</th>
                                            <th className="px-4 py-3 text-center">الكمية</th>
                                            <th className="px-4 py-3 text-center">السعر (DH)</th>
                                            <th className="px-4 py-3 text-left">الإجمالي</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-sm font-bold text-slate-700">
                                        {formData.requiredParts.map((part, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 flex items-center gap-2">
                                                    <Box size={14} className="text-slate-400"/> {part.name}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-lg w-fit mx-auto px-1">
                                                        <button type="button" onClick={() => handleUpdatePartQty(part.inventoryId, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-500">-</button>
                                                        <span className="text-xs font-black w-4 text-center">{part.quantity}</span>
                                                        <button type="button" onClick={() => handleUpdatePartQty(part.inventoryId, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-500">+</button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono">{part.price}</td>
                                                <td className="px-4 py-3 text-left font-black font-mono">{(part.price * part.quantity).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button type="button" onClick={() => handleRemovePart(part.inventoryId)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-100 border-t border-slate-200">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">إجمالي القطع المقدر</td>
                                            <td colSpan={2} className="px-4 py-3 text-left font-black text-blue-600 font-mono text-lg">{estimatedPartsCost.toLocaleString()} DH</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <Package size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-xs font-bold text-slate-400">لم يتم تحديد أي قطع غيار. اضغط على "إضافة من المخزن" إذا لزم الأمر.</p>
                            </div>
                        )}
                    </div>

                 </form>

                 {/* Sticky Footer Action */}
                 <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <User size={16} /> المشخص: <span className="text-slate-900 font-black">{formData.diagnosedBy}</span>
                    </div>
                    <button 
                        onClick={handleDiagnose} 
                        disabled={isProcessing}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        حفظ التشخيص وإغلاق التذكرة
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Inventory Picker Modal */}
      {showPartPicker && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-xl h-[70vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                     <Package size={24} className="text-amber-400" />
                     <h3 className="text-xl font-black">المستودع وقطع الغيار</h3>
                  </div>
                  <button onClick={() => setShowPartPicker(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all"><X size={20}/></button>
               </div>
               
               <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                     <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
                     <input 
                        className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="ابحث باسم القطعة أو الكود..."
                        value={partSearch}
                        onChange={e => setPartSearch(e.target.value)}
                        autoFocus
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/50">
                  {filteredInventory.map(item => (
                     <button 
                        key={item.id} 
                        onClick={() => handleAddPart(item)}
                        className="w-full bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex justify-between items-center group text-right"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              <Box size={20} />
                           </div>
                           <div>
                              <p className="font-black text-slate-800 text-sm group-hover:text-blue-700">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{item.sku || 'No SKU'} • Stock: {item.quantity}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-sm font-black text-slate-900 font-mono">{item.sellingPrice} DH</span>
                           <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-lg">+ إضافة</span>
                        </div>
                     </button>
                  ))}
                  {filteredInventory.length === 0 && (
                      <div className="py-12 text-center opacity-40">
                          <ShoppingCart size={40} className="mx-auto mb-2 text-slate-400" />
                          <p className="text-xs font-bold text-slate-500">لا توجد نتائج مطابقة</p>
                      </div>
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default TechnicalAnalysis;
