
import React, { useState, useEffect } from 'react';
import { AppState, ServicePrice, GIMServiceCategory } from '../types';
import { 
  Plus, Tag, Trash2, DollarSign, Banknote, Zap, X, Save, 
  Search, Hammer, Shield, Monitor, Globe, Smartphone, 
  Network, Edit2, Eye, Info, CheckCircle2, LayoutGrid, AlertTriangle,
  Skull
} from 'lucide-react';
import { generateSmartDocNumber } from '../db';

interface PricingPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingService, setEditingService] = useState<ServicePrice | null>(null);
  const [viewingService, setViewingService] = useState<ServicePrice | null>(null);

  const [formData, setFormData] = useState<Omit<ServicePrice, 'id'>>({
    code: '',
    serviceName: '',
    category: 'Security & Networks',
    price: 0,
    description: ''
  });

  // توليد كود الخدمة آلياً
  useEffect(() => {
    if (showForm && !editingService && !formData.code) {
      const autoCode = generateSmartDocNumber('SRV', state.servicePrices.length);
      setFormData(prev => ({ ...prev, code: autoCode }));
    }
  }, [showForm, editingService, state.servicePrices.length]);

  const handleEditClick = (service: ServicePrice, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setEditingService(service);
    setFormData({ 
      code: service.code || '', 
      serviceName: service.serviceName, 
      category: service.category, 
      price: service.price, 
      description: service.description 
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateState(prev => ({
        ...prev,
        servicePrices: prev.servicePrices.map(s => s.id === editingService.id ? { ...s, ...formData } : s)
      }));
    } else {
      const newService: ServicePrice = { ...formData, id: crypto.randomUUID() };
      updateState(prev => ({
        ...prev,
        servicePrices: [...prev.servicePrices, newService]
      }));
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ code: '', serviceName: '', category: 'Security & Networks', price: 0, description: '' });
  };

  // --- وظيفة الحذف النهائية الصارمة (Individual Atomic Deletion) ---
  const deleteService = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (window.confirm('⚠️ حذف نهائي: هل أنت متأكد من مسح هذه الخدمة من النظام؟')) {
      updateState((prevState) => {
        // تصفية المصفوفة لإنشاء مرجع جديد تماماً في الذاكرة لضمان استجابة React
        const newServicePrices = prevState.servicePrices.filter((s) => s.id !== id);
        
        return {
          ...prevState,
          servicePrices: newServicePrices,
          automationLogs: [{
             id: crypto.randomUUID(),
             timestamp: new Date().toISOString(),
             action: 'SERVICE_REMOVED',
             status: 'success',
             details: `تم مسح الخدمة ID: ${id} من الفهرس الرسمي.`
          }, ...(prevState.automationLogs || [])]
        };
      });
      
      if (viewingService?.id === id) setViewingService(null);
    }
  };

  // --- وظيفة مسح الفهرس بالكامل (Total Atomic Purge) ---
  const clearAllServices = () => {
    if (window.confirm('🚨 تحذير أمن الأنظمة: هل تريد حقاً مسح كل الخدمات من الفهرس؟\nسيتم إفراغ قاعدة بيانات الأثمنة بالكامل!')) {
       if (window.confirm('الخطوة الأخيرة: هل أنت متأكد بنسبة 100%؟ لا يمكن التراجع عن هذا الإجراء.')) {
          updateState(prev => ({
            ...prev,
            servicePrices: [], // إفراغ المصفوفة تماماً
            automationLogs: [{
               id: crypto.randomUUID(),
               timestamp: new Date().toISOString(),
               action: 'INDEX_PURGED_COMPLETELY',
               status: 'success',
               details: 'قام المسؤول بتطهير فهرس الخدمات بالكامل.'
            }, ...(prev.automationLogs || [])]
          }));
          alert('تم تطهير الفهرس بنجاح.');
       }
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Security & Networks': return <Network size={20} className="text-blue-500" />;
      case 'Web & Apps': return <Globe size={20} className="text-purple-500" />;
      case 'Smart Home': return <Zap size={20} className="text-amber-500" />;
      default: return <Tag size={20} className="text-slate-500" />;
    }
  };

  const filteredServices = state.servicePrices.filter(s => 
    s.serviceName.toLowerCase().includes(search.toLowerCase()) || 
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
             <Banknote className="text-blue-600" size={32} /> فهرس أثمنة الخدمات (Official Index)
          </h2>
          <p className="text-slate-500 font-medium mt-1">التحكم المركزي في قائمة الخدمات والأسعار الرسمية لـ Electro GIM</p>
        </div>
        <div className="flex gap-4">
           {state.servicePrices.length > 0 && (
             <button 
                onClick={clearAllServices}
                className="bg-red-50 text-red-600 px-6 py-4 rounded-[1.5rem] font-black flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm active:scale-95"
             >
                <Skull size={20} /> مسح كل الخدمات
             </button>
           )}
           <button 
              onClick={() => { resetForm(); setShowForm(true); }} 
              className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
           >
              <Plus size={20} /> إضافة خدمة جديدة
           </button>
        </div>
      </div>

      <div className="relative mb-8 max-w-2xl group">
         <Search className="absolute right-5 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
         <input 
            className="w-full pr-14 pl-6 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none" 
            placeholder="البحث باسم الخدمة أو الكود..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
               <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-blue-50 transition-colors">{getCategoryIcon(service.category)}</div>
               <div className="flex flex-col items-end gap-3">
                  <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase">{service.code}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={(e) => { e.stopPropagation(); setViewingService(service); }} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"><Eye size={16}/></button>
                     <button onClick={(e) => handleEditClick(service, e)} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm"><Edit2 size={16}/></button>
                     <button onClick={(e) => deleteService(service.id, e)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                  </div>
               </div>
            </div>
            <div className="flex-1">
               <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{service.serviceName}</h3>
               <p className="text-xs text-slate-400 font-bold mb-8 line-clamp-2">{service.description}</p>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
               <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{service.category}</span>
               <p className="text-2xl font-black text-green-600 font-mono tracking-tighter">{service.price.toLocaleString()} <span className="text-xs">DH</span></p>
            </div>
          </div>
        ))}
        {filteredServices.length === 0 && (
           <div className="col-span-full py-20 text-center opacity-20">
              <Zap size={64} className="mx-auto mb-4" />
              <p className="text-xl font-black uppercase">الفهرس فارغ أو لا توجد نتائج</p>
           </div>
        )}
      </div>

      {/* View Modal */}
      {viewingService && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setViewingService(null)}>
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in" onClick={e => e.stopPropagation()}>
              <div className="p-10 bg-slate-900 text-white relative">
                 <h3 className="text-3xl font-black">{viewingService.serviceName}</h3>
                 <p className="text-blue-400 font-mono text-sm mt-1">CODE: {viewingService.code}</p>
                 <LayoutGrid className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 mb-2">القسم</p>
                       <p className="text-lg font-black">{viewingService.category}</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                       <p className="text-[9px] font-black text-blue-400 mb-2">ثمن الخدمة</p>
                       <p className="text-2xl font-black text-blue-600 font-mono">{viewingService.price.toLocaleString()} DH</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                    <p className="text-sm font-bold text-slate-600">"{viewingService.description || 'لا يوجد وصف.'}"</p>
                 </div>
                 <button onClick={() => setViewingService(null)} className="w-full bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs">إغلاق</button>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in" onClick={e => e.stopPropagation()}>
             <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-blue-900 uppercase">{editingService ? 'تعديل الخدمة' : 'خدمة جديدة'}</h3>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-red-600 transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-10 space-y-6 text-right">
                <div className="space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2">كود الخدمة</label>
                         <input readOnly className="w-full px-6 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl font-black font-mono text-blue-600" value={formData.code} />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2">التصنيف</label>
                         <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as GIMServiceCategory})}>
                            <option value="Security & Networks">الكاميرات والشبكات</option>
                            <option value="Web & Apps">المواقع والتطبيقات</option>
                            <option value="Smart Home">البيت الذكي</option>
                            <option value="GIM Store">متجر GIM</option>
                         </select>
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2">اسم الخدمة</label>
                      <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="مثال: تركيب كاميرا 4K" value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2">الثمن المعتمد (DH)</label>
                      <input type="number" step="0.01" required className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-blue-600 text-2xl outline-none focus:ring-4 focus:ring-blue-500/10" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2">الوصف</label>
                      <textarea rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none shadow-inner focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                   </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-blue-600 transition-all uppercase text-xs flex items-center justify-center gap-3">
                   <Save size={18} /> {editingService ? 'تحديث الفهرس' : 'حفظ الخدمة'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
