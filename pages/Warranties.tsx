
import React, { useState, useEffect } from 'react';
import { AppState, DocType, Document, Client, InventoryItem, ServicePrice } from '../types';
import { 
  ShieldCheck, Plus, Search, Trash2, Eye, 
  Clock, Calendar, FileText, CheckCircle2, 
  AlertTriangle, ArrowRight, Save, X, 
  Download, Printer, Award, Brain, Sparkles,
  Zap, Building2, User, Package, Box, SearchCode,
  DollarSign, RefreshCw, Wrench, Settings, Hammer
} from 'lucide-react';
import { generateDocNumber, generateSmartDocNumber } from '../db';

interface WarrantiesPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onPrint: (doc: Document) => void;
}

const WarrantiesPage: React.FC<WarrantiesPageProps> = ({ state, updateState, onPrint }) => {
  const [showForm, setShowForm] = useState(false);
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Expired'>('All');

  // We filter documents that are either Warranties or Maintenance Reports (treated as certificates here)
  const warranties = state.documents.filter(d => d.type === DocType.GARANTIE || d.type === DocType.CONTRAT);
  
  const [formData, setFormData] = useState({
    type: DocType.GARANTIE,
    clientId: '',
    reference: '',
    durationMonths: 12,
    notes: '',
    interventionDetails: '', 
    productPrice: 0 
  });

  // Auto-generate reference number when form opens or type changes
  useEffect(() => {
    if (showForm) {
      const todayStr = new Date().toISOString().split('T')[0];
      const prefix = formData.type === DocType.GARANTIE ? 'WNT' : 'MNT';
      // Count existing docs of this type today
      const countToday = state.documents.filter(d => d.date === todayStr && (d.number.startsWith('WNT') || d.number.startsWith('MNT'))).length;
      const autoRef = generateSmartDocNumber(prefix, countToday);
      setFormData(prev => ({ ...prev, reference: autoRef }));
    }
  }, [showForm, formData.type, state.documents]);

  const filteredInventory = state.inventory.filter(item => 
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    item.sku?.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const filteredServices = state.servicePrices.filter(srv => 
    srv.serviceName.toLowerCase().includes(serviceSearch.toLowerCase()) || 
    srv.code?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const selectProduct = (item: InventoryItem) => {
    setFormData(prev => ({
      ...prev,
      interventionDetails: `${item.name} (SKU: ${item.sku || 'N/A'})`,
      productPrice: item.sellingPrice
    }));
    setShowInventoryPicker(false);
  };

  const selectService = (srv: ServicePrice) => {
    setFormData(prev => ({
      ...prev,
      interventionDetails: `${srv.serviceName} (${srv.category})`,
      productPrice: srv.price,
      notes: `خدمة مرجعية: ${srv.code}\n${srv.description}`
    }));
    setShowServicePicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = state.documents.filter(d => d.type === formData.type).length;
    const newDoc: Document = {
      id: crypto.randomUUID(),
      clientId: formData.clientId,
      type: formData.type,
      number: formData.reference,
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.type === DocType.GARANTIE 
        ? new Date(Date.now() + (formData.durationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        : undefined,
      items: [],
      subtotal: formData.productPrice,
      tva: 0,
      total: formData.productPrice,
      status: 'Paid',
      notes: formData.notes,
      interventionDetails: formData.interventionDetails,
      warrantyPeriod: formData.type === DocType.GARANTIE ? `${formData.durationMonths} شهراً` : 'صيانة دورية'
    };

    updateState(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc],
      automationLogs: [{
         id: crypto.randomUUID(),
         timestamp: new Date().toISOString(),
         action: formData.type === DocType.GARANTIE ? 'WARRANTY_ISSUED' : 'MAINTENANCE_CERT_ISSUED',
         status: 'success',
         details: `تم إصدار ${formData.type === DocType.GARANTIE ? 'شهادة ضمان' : 'عقد صيانة'} رقم ${newDoc.number} للزبون ${state.clients.find(c => c.id === formData.clientId)?.name}`
      }, ...(prev.automationLogs || [])]
    }));
    setShowForm(false);
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({
      type: DocType.GARANTIE,
      clientId: '',
      reference: '',
      durationMonths: 12,
      notes: '',
      interventionDetails: '',
      productPrice: 0
    });
  };

  const isExpired = (dueDate?: string) => dueDate ? new Date(dueDate) < new Date() : false;

  const filteredWarranties = warranties.filter(w => {
    const client = state.clients.find(c => c.id === w.clientId);
    const matchesSearch = w.number.includes(search) || client?.name.toLowerCase().includes(search.toLowerCase());
    const expired = isExpired(w.dueDate);
    const matchesFilter = filter === 'All' || (filter === 'Active' && !expired) || (filter === 'Expired' && expired);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      
      {/* Header Area */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <ShieldCheck className="text-amber-500" size={32} /> السجلات الرسمية (Certificates Hub)
          </h2>
          <p className="text-slate-500 font-medium">إصدار شواهد الضمان، عقود الصيانة، والالتزامات التقنية الموثقة</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={20} /> إنشاء مستند جديد
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المستندات</p>
            <p className="text-2xl font-black text-slate-800">{warranties.length}</p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">شهادات الضمان</p>
            <p className="text-2xl font-black text-amber-600">{warranties.filter(w => w.type === DocType.GARANTIE).length}</p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">عقود الصيانة</p>
            <p className="text-2xl font-black text-blue-600">{warranties.filter(w => w.type === DocType.CONTRAT).length}</p>
         </div>
         <div className="bg-blue-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
               <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">حالة الالتزام</p>
               <p className="text-xl font-black uppercase">Official GIM</p>
            </div>
            <Award className="absolute -left-2 -bottom-2 text-white/10" size={80} />
         </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
            <input 
               className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
               placeholder="البحث برقم المرجع أو اسم الزبون..."
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
         </div>
         <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
            {['All', 'Active', 'Expired'].map(f => (
               <button 
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  {f === 'All' ? 'الكل' : f === 'Active' ? 'نشطة' : 'منتهية'}
               </button>
            ))}
         </div>
      </div>

      {/* Grid of documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredWarranties.slice().reverse().map(doc => {
            const client = state.clients.find(c => c.id === doc.clientId);
            const expired = isExpired(doc.dueDate);
            const isWarranty = doc.type === DocType.GARANTIE;
            
            return (
               <div key={doc.id} className={`bg-white rounded-[2.5rem] border-2 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden ${expired ? 'border-red-100' : 'border-slate-100 hover:border-blue-200'}`}>
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-3 rounded-2xl ${isWarranty ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} shadow-lg`}>
                        {isWarranty ? <Award size={24} /> : <Wrench size={24} />}
                     </div>
                     <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase border ${expired ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {doc.type === DocType.GARANTIE ? 'GARANTIE' : 'MAINTENANCE'}
                     </span>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors font-mono">{doc.number}</h3>
                        <div className="flex items-center gap-2 mt-1 text-slate-400">
                           <Building2 size={12} />
                           <span className="text-[10px] font-black uppercase">{client?.name}</span>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between text-[10px] font-black">
                           <span className="text-slate-400">تاريخ الإصدار:</span>
                           <span className="text-slate-800">{doc.date}</span>
                        </div>
                        {isWarranty && (
                           <div className="flex justify-between text-[10px] font-black">
                              <span className="text-slate-400">تاريخ الانتهاء:</span>
                              <span className={expired ? 'text-red-500' : 'text-slate-800'}>{doc.dueDate || '---'}</span>
                           </div>
                        )}
                        <div className="flex justify-between text-[10px] font-black border-t border-slate-200 pt-2">
                           <span className="text-slate-400 uppercase">القيمة المصرح بها:</span>
                           <span className="text-blue-600 font-mono">{doc.total.toLocaleString()} DH</span>
                        </div>
                     </div>

                     <div className="pt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">البيان التقني / المعدات</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{doc.interventionDetails || '---'}</p>
                     </div>

                     <div className="flex gap-2 pt-4 border-t border-slate-50">
                        <button 
                           onClick={() => onPrint(doc)}
                           className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                           <Printer size={14} /> طباعة المستند
                        </button>
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>

      {/* Main Creation Form Modal */}
      {showForm && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                  <div>
                     <h3 className="text-2xl font-black text-blue-900 tracking-tighter uppercase">إصدار سجل تقني رسمي</h3>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Unified Certificate Generation System</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 transition-all"><X size={24} /></button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-10 space-y-6 text-right" dir="rtl">
                  {/* Type Selector */}
                  <div className="flex gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200">
                     <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: DocType.GARANTIE})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.type === DocType.GARANTIE ? 'bg-white shadow-sm text-amber-600 border border-amber-100' : 'text-slate-400'}`}
                     >
                        <Award size={16} /> شهادة ضمان (Garantie)
                     </button>
                     <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: DocType.CONTRAT})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.type === DocType.CONTRAT ? 'bg-white shadow-sm text-blue-600 border border-blue-100' : 'text-slate-400'}`}
                     >
                        <Wrench size={16} /> شهادة صيانة (Maintenance)
                     </button>
                  </div>

                  <div className="space-y-5">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الزبون المستفيد</label>
                        <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                           <option value="">-- اختر الزبون --</option>
                           {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center justify-between">
                              مرجع المستند (Auto)
                              <Zap size={10} className="text-blue-500 fill-blue-500" />
                           </label>
                           <div className="relative">
                              <input 
                                 readOnly
                                 className="w-full px-6 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl font-black font-mono text-blue-900 cursor-default" 
                                 value={formData.reference} 
                              />
                              <div className="absolute left-3 top-3 text-[8px] font-black text-blue-500 bg-blue-100 px-2 py-1 rounded-lg uppercase">Sequential</div>
                           </div>
                        </div>
                        {formData.type === DocType.GARANTIE && (
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">مدة الضمان (بالأشهر)</label>
                              <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: parseInt(e.target.value)})}>
                                 {[3, 6, 12, 24, 60].map(m => <option key={m} value={m}>{m} أشهر</option>)}
                              </select>
                           </div>
                        )}
                        {formData.type === DocType.CONTRAT && (
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">نوع التعاقد</label>
                              <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                                 <option>صيانة دورية (أسبوعي)</option>
                                 <option>صيانة دورية (شهري)</option>
                                 <option>صيانة سنوية شاملة</option>
                              </select>
                           </div>
                        )}
                     </div>

                     {/* Detail Section with Pickers */}
                     <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] space-y-5 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Settings size={14} className="text-blue-500" /> تفاصيل السلعة أو الخدمة
                           </h4>
                           <div className="flex gap-2">
                              <button 
                                 type="button"
                                 onClick={() => setShowInventoryPicker(true)}
                                 className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black flex items-center gap-2 hover:bg-slate-200 transition-all"
                              >
                                 <Package size={12} /> استيراد سلعة
                              </button>
                              <button 
                                 type="button"
                                 onClick={() => setShowServicePicker(true)}
                                 className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                              >
                                 <Wrench size={12} /> استيراد خدمة
                              </button>
                           </div>
                        </div>

                        <textarea 
                           required 
                           rows={3} 
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none shadow-inner" 
                           placeholder="أدخل تفاصيل الجهاز، الموديل، أو وصف الخدمة المقدمة..." 
                           value={formData.interventionDetails} 
                           onChange={e => setFormData({...formData, interventionDetails: e.target.value})} 
                        />

                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">القيمة المالية المصرح بها (DH)</label>
                           <div className="relative">
                              <DollarSign className="absolute right-4 top-3.5 text-slate-400" size={16} />
                              <input 
                                 type="number"
                                 step="0.01"
                                 className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                                 value={formData.productPrice}
                                 onChange={e => setFormData({...formData, productPrice: parseFloat(e.target.value)})}
                              />
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">شروط إضافية أو ملاحظات</label>
                        <textarea rows={2} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none shadow-inner" placeholder="..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                     <Save size={18} /> حفظ السجل وتوليد المستند القانوني
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* Inventory Item Picker Modal */}
      {showInventoryPicker && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl h-[70vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <Package size={24} className="text-blue-400" />
                     <h3 className="text-xl font-black uppercase">اختيار سلعة من المستودع</h3>
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
                     />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {filteredInventory.map(item => (
                     <button key={item.id} onClick={() => selectProduct(item)} className="w-full text-right p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all flex justify-between items-center group">
                        <div>
                           <p className="font-black text-slate-800">{item.name}</p>
                           <p className="text-[10px] font-bold text-slate-400">SKU: {item.sku || 'N/A'}</p>
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-black text-blue-600">{item.sellingPrice.toLocaleString()} DH</p>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* Service Picker Modal */}
      {showServicePicker && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl h-[70vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
               <div className="p-8 bg-blue-900 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <Wrench size={24} className="text-blue-300" />
                     <h3 className="text-xl font-black uppercase">استيراد خدمة من الفهرس</h3>
                  </div>
                  <button onClick={() => setShowServicePicker(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
               </div>
               <div className="p-6 bg-blue-50/30 border-b border-blue-100">
                  <div className="relative">
                     <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
                     <input 
                        className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none" 
                        placeholder="ابحث بالاسم أو رمز الخدمة SRV..."
                        value={serviceSearch}
                        onChange={e => setServiceSearch(e.target.value)}
                     />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {filteredServices.map(srv => (
                     <button key={srv.id} onClick={() => selectService(srv)} className="w-full text-right p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                           <div className="bg-slate-100 p-3 rounded-xl text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <Hammer size={18} />
                           </div>
                           <div>
                              <p className="font-black text-slate-800">{srv.serviceName}</p>
                              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase">{srv.category}</span>
                           </div>
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-black text-green-600">{srv.price.toLocaleString()} DH</p>
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{srv.code}</p>
                        </div>
                     </button>
                  ))}
                  {filteredServices.length === 0 && (
                     <div className="py-20 text-center opacity-30">
                        <SearchCode size={48} className="mx-auto mb-2" />
                        <p className="font-black text-sm uppercase">لا توجد خدمات مطابقة للفهرس</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default WarrantiesPage;
