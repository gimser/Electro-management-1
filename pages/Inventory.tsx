
import React, { useState } from 'react';
import { AppState, InventoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Trash2, Edit2, UserPlus, Star, TrendingUp, 
  AlertCircle, Heart, Crown, Building2, User, Phone, 
  Mail, MapPin, History, MessageSquare, ClipboardList,
  X, Save, FileText, CheckCircle2, ChevronRight, BarChart3,
  Users, Filter, MoreHorizontal, Box, Wrench, AlertTriangle,
  ShoppingBag, Tag, Calculator, ScanBarcode, PackageCheck
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

interface InventoryPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    sku: '',
    category: 'Security',
    quantity: 0,
    unit: 'pcs',
    purchasePrice: 0,
    sellingPrice: 0,
    minStock: 5
  });

  const generateSKU = () => {
      const prefix = formData.category.substring(0, 3).toUpperCase();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const sku = `${prefix}-${new Date().getFullYear()}-${random}`;
      setFormData(prev => ({...prev, sku}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg('يرجى إدخال اسم الصنف');
      return;
    }
    if (formData.quantity < 0) {
      setErrorMsg('الكمية لا يمكن أن تكون سالبة');
      return;
    }

    const newItem: InventoryItem = {
      ...formData,
      id: crypto.randomUUID(),
      sku: formData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      quantity: Number(formData.quantity),
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      minStock: Number(formData.minStock)
    };

    updateState(prev => ({
      ...prev,
      inventory: [newItem, ...(prev.inventory || [])],
      activityLogs: [{
        id: crypto.randomUUID(),
        userId: authUser?.id || 'system',
        username: authUser?.fullName || 'System',
        action: 'INVENTORY_ITEM_ADDED',
        module: 'INVENTORY',
        timestamp: new Date().toISOString(),
        details: `إضافة مستلزم تقني: ${newItem.name} (Qty: ${newItem.quantity})`,
        severity: 'Info'
      }, ...(prev.activityLogs || [])]
    }));

    resetForm();
    setSuccessMsg('تم إضافة الصنف بنجاح!');
  };

  const handleDeleteAllInventory = async () => {
    if (state.inventory.length === 0) return;
    
    if (window.confirm('🚨 تحذير: هل أنت متأكد من حذف جميع أصناف المخزن؟')) {
      const confirmCode = Math.floor(1000 + Math.random() * 9000).toString();
      const userInput = window.prompt(`لتأكيد الحذف النهائي لـ ${state.inventory.length} صنف، يرجى إدخال الرمز التالي: ${confirmCode}`);
      
      if (userInput === confirmCode) {
        updateState(prev => ({
          ...prev,
          inventory: [],
          activityLogs: [{
            id: crypto.randomUUID(),
            userId: authUser?.id || 'system',
            username: authUser?.fullName || 'System',
            action: 'ALL_INVENTORY_REMOVED',
            module: 'INVENTORY',
            timestamp: new Date().toISOString(),
            details: `تم مسح جميع أصناف المخزن (${state.inventory.length} سجل).`,
            severity: 'Warning'
          }, ...(prev.activityLogs || [])]
        }));
        alert('تم حذف جميع الأصناف بنجاح.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', sku: '', category: 'Security', quantity: 0, 
      unit: 'pcs', purchasePrice: 0, sellingPrice: 0, minStock: 5 
    });
    setShowForm(false);
  };

  const deleteItem = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      updateState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i.id !== confirmDeleteId)
      }));
      setConfirmDeleteId(null);
    }
  };

  const filteredItems = (state.inventory || []).filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-slide-up text-right font-arabic max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
             <Box className="text-blue-600" size={32} /> المستلزمات التقنية والمخزن
          </h2>
          <p className="text-slate-500 font-medium">تتبع المعدات والقطع المستخدمة في الصيانة والتركيب</p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <button 
            onClick={handleDeleteAllInventory} 
            className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-red-500 transition-all active:scale-95"
          >
            <Trash2 size={20} /> حذف الكل
          </button>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
          >
            <Plus size={20} /> إضافة صنف جديد
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative max-w-md w-full">
               <Search className="absolute right-4 top-3 text-slate-400" size={18} />
               <input 
                  className="w-full pr-12 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none text-sm shadow-inner" 
                  placeholder="بحث باسم الصنف أو SKU..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
               <AlertTriangle size={16} /> تنبيه: تذكر إضافة كلفة المستلزمات في فواتير الزبناء.
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">الاسم / الموديل</th>
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">الكمية</th>
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">ثمن الشراء</th>
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">ثمن البيع</th>
                     <th className="px-8 py-4 w-20 text-left">الإجراءات</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredItems.map(item => (
                     <tr key={item.id} className="hover:bg-blue-50/20 transition-all group">
                        <td className="px-8 py-5">
                           <p className="font-black text-slate-800 text-sm">{item.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{item.sku}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={`px-4 py-1.5 rounded-xl font-black text-xs ${item.quantity <= (item.minStock || 0) ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600'}`}>
                              {item.quantity} {item.unit}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-center font-black font-mono text-sm text-slate-500">{item.purchasePrice} DH</td>
                        <td className="px-8 py-5 text-center font-black font-mono text-sm text-blue-600">{item.sellingPrice} DH</td>
                        <td className="px-8 py-5 text-left">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">إضافة مستلزم تقني جديد</h3>
                   <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">GIM Inventory System</p>
                </div>
                <button onClick={resetForm} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all shadow-xl"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">اسم الصنف / الموديل</label>
                      <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: كاميرا Hikvision 5MP..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">رمز التخزين (SKU)</label>
                      <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="SRV-CAM-001" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                      <button type="button" onClick={generateSKU} className="absolute left-3 top-9 text-slate-400 hover:text-blue-600" title="توليد تلقائي"><ScanBarcode size={20}/></button>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الفئة</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                         <option value="Security">أنظمة أمنية</option>
                         <option value="Networking">شبكات</option>
                         <option value="SmartHome">منزل ذكي</option>
                         <option value="Cabling">كابلات ولوازم</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الكمية المتوفرة</label>
                      <input type="number" min="0" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">ثمن الشراء HT (DH)</label>
                      <input type="number" min="0" step="0.01" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black font-mono focus:ring-2 focus:ring-blue-500 outline-none" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2 text-blue-600">ثمن البيع المقترح (DH)</label>
                      <input type="number" min="0" step="0.01" required className="w-full px-6 py-4 bg-blue-50 border border-blue-200 rounded-2xl font-black font-mono text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                   <PackageCheck size={20} /> تثبيت المستلزم في المخزن
                </button>
             </form>
          </div>
        </div>
      )}
      {/* Success/Error Toasts */}
      <AnimatePresence>
        {(errorMsg || successMsg) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-[300] font-black flex items-center gap-3 ${errorMsg ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
          >
            {errorMsg ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            {errorMsg || successMsg}
            <button onClick={() => { setErrorMsg(null); setSuccessMsg(null); }} className="p-1 hover:bg-white/20 rounded-lg"><X size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="حذف الصنف"
        message="هل أنت متأكد من حذف هذا الصنف من المخزن؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        confirmText="حذف نهائي"
      />
    </div>
  );
};

export default InventoryPage;
