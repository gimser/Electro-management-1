
import React, { useState, useEffect } from 'react';
import { AppState, InventoryItem, StockMovement, MovementType, DocType, Document } from '../types';
import { 
  Plus, Trash2, Package, AlertTriangle, Edit2, Search, 
  X, Save, Box, ArrowUpRight, ArrowDownLeft, Eye, 
  TrendingUp, DollarSign, Tag, Shield, Globe, Zap, History, Info,
  ShoppingCart, Truck, Mail, Send, CheckCircle2, ShoppingBag, Banknote, Percent
} from 'lucide-react';
import { generateSmartDocNumber } from '../db';

interface InventoryPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'restock'>('items');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [showPODraft, setShowPODraft] = useState<{item: InventoryItem, provider: string, price: number} | null>(null);

  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    sku: '',
    category: 'Security & Networks' as any,
    quantity: 0,
    unit: 'Unit',
    minQuantity: 5,
    purchasePrice: 0,
    sellingPrice: 0
  });

  const getRestockIntel = (itemId: string) => {
    const lastPurchase = state.documents
      .filter(d => d.type === DocType.ACHAT)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find(d => d.items.some(line => line.inventoryId === itemId));

    if (lastPurchase) {
      const itemLine = lastPurchase.items.find(line => line.inventoryId === itemId);
      return {
        provider: lastPurchase.providerName || 'مزود غير معروف',
        lastPrice: itemLine?.unitPrice || 0
      };
    }
    return { provider: 'لم يتم الشراء مسبقاً', lastPrice: 0 };
  };

  const lowStockItems = state.inventory.filter(i => i.quantity <= i.minQuantity);

  const filteredInventory = state.inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    if (showForm && !editingItem && !formData.sku) {
      const autoSku = generateSmartDocNumber('SKU', state.inventory.length);
      setFormData(prev => ({ ...prev, sku: autoSku }));
    }
  }, [showForm, editingItem, state.inventory.length]);

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowForm(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('⚠️ تحذير هندسي: سيتم حذف هذا الصنف نهائياً. هل تريد المتابعة؟')) {
      updateState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(item => item.id !== id)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateState(prev => ({
        ...prev,
        inventory: prev.inventory.map(i => i.id === editingItem.id ? { ...i, ...formData } : i)
      }));
    } else {
      const newItem: InventoryItem = { ...formData, id: crypto.randomUUID() };
      updateState(prev => ({
        ...prev,
        inventory: [...prev.inventory, newItem],
        stockMovements: [{
          id: crypto.randomUUID(),
          inventoryId: newItem.id,
          type: 'IN',
          quantity: newItem.quantity,
          date: new Date().toISOString().split('T')[0],
          reason: 'Initial Stocking',
          performedBy: 'admin'
        }, ...(prev.stockMovements || [])]
      }));
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ name: '', sku: '', category: 'Security & Networks', quantity: 0, unit: 'Unit', minQuantity: 5, purchasePrice: 0, sellingPrice: 0 });
  };

  const handleSendDraftPO = (intel: {item: InventoryItem, provider: string, price: number}) => {
    const msg = `طلب تزويد سلعة - Electro GIM Services\n\nإلى المزود: ${intel.provider}\nنود طلب كمية جديدة من الصنف: ${intel.item.name}\nالمرجع (SKU): ${intel.item.sku}\nآخر ثمن معتمد: ${intel.price} DH\n\nيرجى تأكيد التوفر لإرسال أمر الشراء الرسمي.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    
    updateState(prev => ({
      ...prev,
      automationLogs: [{
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'PREDICTIVE_RESTOCK_SENT',
        status: 'success',
        details: `تم إرسال مسودة طلب شراء للصنف ${intel.item.name} للمزود ${intel.provider}.`
      }, ...(prev.automationLogs || [])]
    }));
    setShowPODraft(null);
  };

  const profit = formData.sellingPrice - formData.purchasePrice;
  const profitMargin = formData.sellingPrice > 0 ? (profit / formData.sellingPrice) * 100 : 0;

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
             <Package className="text-blue-600" size={32} /> مستودع الأصول والقطع (Inventory)
          </h2>
          <p className="text-slate-500 font-medium">إدارة المخزون والأسعار ومحرك التزويد التوقعي</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
              <button onClick={() => setActiveTab('items')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'items' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>الأصناف</button>
              <button onClick={() => setActiveTab('restock')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activeTab === 'restock' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400'}`}>
                 تنبيهات التزويد {lowStockItems.length > 0 && <span className="bg-white text-red-600 px-1.5 rounded-md text-[8px]">{lowStockItems.length}</span>}
              </button>
              <button onClick={() => setActiveTab('movements')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'movements' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>سجل الحركات</button>
           </div>
           <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-[1.2rem] font-black flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all active:scale-95">
             <Plus size={20} /> إضافة صنف
           </button>
        </div>
      </div>

      {activeTab === 'items' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث باسم الصنف أو المرجع..." 
                  className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-blue-500 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">المنتج / المرجع</th>
                       <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">الكمية</th>
                       <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">سعر الشراء</th>
                       <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">سعر البيع</th>
                       <th className="px-8 py-4 text-left font-black text-slate-400 text-[10px] uppercase tracking-widest">الإجراءات</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredInventory.map(item => (
                       <tr key={item.id} className="hover:bg-blue-50/20 transition-all group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                   <Package size={20} />
                                </div>
                                <div>
                                   <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{item.name}</p>
                                   <p className="text-[10px] font-mono text-slate-400 font-black tracking-widest uppercase">{item.sku}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className={`px-4 py-1.5 rounded-xl text-sm font-black inline-block ${item.quantity <= item.minQuantity ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-slate-50 text-slate-800 border border-slate-100'}`}>
                                {item.quantity} <span className="text-[10px] opacity-40 uppercase tracking-tighter">{item.unit}</span>
                             </span>
                          </td>
                          <td className="px-8 py-5 text-center font-black text-slate-400 font-mono italic">{item.purchasePrice.toLocaleString()} DH</td>
                          <td className="px-8 py-5 text-center font-black text-blue-600 font-mono">{item.sellingPrice.toLocaleString()} DH</td>
                          <td className="px-8 py-5 text-left">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => setViewingItem(item)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Eye size={18} /></button>
                                <button onClick={() => handleEditClick(item)} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Edit2 size={18} /></button>
                                <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Trash2 size={18} /></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : activeTab === 'restock' ? (
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
              <div className="relative z-10 flex items-center gap-8">
                 <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center animate-pulse shadow-2xl shadow-red-500/20">
                    <Zap size={40} className="text-white fill-white" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">مركز التزويد الذكي (Restock Intel)</h3>
                    <p className="text-slate-400 font-bold text-sm">يقوم النظام حالياً بتحليل أرشيف المشتريات لتجهيز طلبات الأصناف الناقصة.</p>
                 </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(220,38,38,0.1),transparent)] pointer-events-none"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lowStockItems.length > 0 ? lowStockItems.map(item => {
                const intel = getRestockIntel(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-[2.5rem] border-2 border-red-100 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col">
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-red-50 text-red-600 shadow-inner">
                           <AlertTriangle size={24} />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المخزون الحرج</p>
                           <p className="text-xl font-black text-red-600">{item.quantity} / {item.minQuantity}</p>
                        </div>
                     </div>
                     
                     <h4 className="text-xl font-black text-slate-800 mb-6">{item.name}</h4>
                     
                     <div className="space-y-4 flex-1">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">آخر مزود معروف</p>
                              <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                                 <Truck size={14} className="text-blue-500" /> {intel.provider}
                              </p>
                           </div>
                           <div className="text-left">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">آخر ثمن شراء</p>
                              <p className="text-sm font-black text-blue-600 font-mono">{intel.lastPrice.toLocaleString()} DH</p>
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 pt-4 border-t border-slate-50">
                        <button 
                           onClick={() => setShowPODraft({ item, provider: intel.provider, price: intel.lastPrice })}
                           className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-50 uppercase text-[10px] tracking-widest"
                        >
                           <ShoppingCart size={16} /> توليد مسودة طلب شراء
                        </button>
                     </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 opacity-50">
                   <CheckCircle2 size={80} className="mx-auto text-green-200 mb-4" />
                   <p className="text-slate-400 font-black text-xl uppercase tracking-widest">المخزون في حالة ممتازة</p>
                   <p className="text-slate-300 font-bold mt-2">لا توجد أصناف تحت الحد الأدنى حالياً.</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-4">
           <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <History size={20} className="text-blue-600" />
              <h3 className="font-black text-slate-800">السجل التاريخي لتدفق المخزون</h3>
           </div>
           {state.stockMovements.length > 0 ? state.stockMovements.map(m => {
              const item = state.inventory.find(i => i.id === m.inventoryId);
              return (
                 <div key={m.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-5">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${m.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {m.type === 'IN' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                       </div>
                       <div>
                          <p className="font-black text-base text-slate-800">{item?.name || 'صنف غير معرف'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.date} — {m.reason}</p>
                       </div>
                    </div>
                    <div className="text-left">
                       <span className={`text-xl font-black font-mono ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                          {m.type === 'IN' ? '+' : '-'}{m.quantity}
                       </span>
                    </div>
                 </div>
              );
           }) : (
              <div className="py-20 text-center text-slate-300 italic font-bold">لا توجد حركات مخزنية مسجلة حالياً.</div>
           )}
        </div>
      )}

      {/* Modal: Add/Edit Inventory Item */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center text-right">
                <div>
                   <h3 className="text-2xl font-black text-blue-900 tracking-tighter uppercase">{editingItem ? 'تعديل بيانات الصنف' : 'تعريف صنف جديد'}</h3>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">GIM Database Record Entry</p>
                </div>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 transition-all active:scale-90"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-10 space-y-6 text-right">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">اسم السلعة / المنتج</label>
                      <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: كاميرا 4K ذكية" />
                   </div>
                   <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الكود المرجعي (SKU)</label>
                      <input className="w-full px-6 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl font-black font-mono text-blue-600" value={formData.sku} readOnly={!!editingItem} onChange={e => setFormData({...formData, sku: e.target.value})} />
                   </div>
                   
                   {/* حقول الأثمنة الجديدة */}
                   <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2 flex items-center gap-2"><Banknote size={12}/> ثمن الشراء HT</label>
                        <input type="number" step="0.01" required className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})} />
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase">صافي الربح المتوقع:</span>
                        <span className="text-xs font-black text-green-600">{profit.toLocaleString()} DH</span>
                      </div>
                   </div>

                   <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-400 uppercase mb-2 mr-2 flex items-center gap-2"><DollarSign size={12}/> ثمن البيع HT</label>
                        <input type="number" step="0.01" required className="w-full px-5 py-3 bg-white border border-blue-200 rounded-xl font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})} />
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[9px] font-black text-blue-300 uppercase">هامش الربح:</span>
                        <span className="text-xs font-black text-blue-600">{profitMargin.toFixed(1)}%</span>
                      </div>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الكمية الحالية</label>
                      <input type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black shadow-inner focus:ring-2 focus:ring-blue-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الحد الأدنى (تنبيه)</label>
                      <input type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black shadow-inner focus:ring-2 focus:ring-blue-500" value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value)})} />
                   </div>
                </div>
                
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-600 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 mt-4 active:scale-95">
                   <Save size={20} /> {editingItem ? 'تثبيت التعديلات المحدثة' : 'تسجيل الصنف الجديد رسمياً'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* View & Draft PO Modals (as defined previously) */}
      {viewingItem && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="p-10 bg-slate-900 text-white relative text-right">
                  <div className="relative z-10">
                     <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase mb-4 inline-block tracking-widest border border-blue-400/30 shadow-lg">Product Intelligence</span>
                     <h3 className="text-3xl font-black tracking-tighter">{viewingItem.name}</h3>
                     <p className="text-blue-400 font-mono text-sm mt-1 uppercase tracking-widest">REF: {viewingItem.sku}</p>
                  </div>
                  <Box className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
                  <button onClick={() => setViewingItem(null)} className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors active:scale-90"><X size={32} /></button>
               </div>
               <div className="p-10 space-y-8 text-right">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Box size={12}/> الكمية المتوفرة</p>
                        <p className="text-3xl font-black text-slate-800">{viewingItem.quantity} <span className="text-xs opacity-50">{viewingItem.unit}</span></p>
                     </div>
                     <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col justify-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><DollarSign size={12}/> سعر البيع للوحدة</p>
                        <p className="text-3xl font-black text-blue-600 font-mono">{viewingItem.sellingPrice.toLocaleString()} <span className="text-xs">DH</span></p>
                     </div>
                  </div>
                  <button onClick={() => setViewingItem(null)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-blue-600 transition-all uppercase tracking-widest text-xs active:scale-95">إغلاق</button>
               </div>
            </div>
         </div>
      )}

      {showPODraft && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4 text-right">
           <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-10 bg-blue-900 text-white relative">
                 <div className="relative z-10">
                    <div className="bg-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase mb-4 inline-block tracking-widest border border-blue-400/30">Auto-Generated Draft PO</div>
                    <h3 className="text-3xl font-black tracking-tighter">مسودة طلب تزويد مخزن</h3>
                    <p className="text-blue-300 font-bold mt-2">إلى: {showPODraft.provider}</p>
                 </div>
                 <ShoppingCart className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
                 <button onClick={() => setShowPODraft(null)} className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
              </div>

              <div className="p-10 space-y-8">
                 <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                       <p className="text-sm font-black text-slate-800">{showPODraft.item.name}</p>
                       <span className="text-[10px] font-mono text-slate-400 uppercase">REF: {showPODraft.item.sku}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الكمية المقترحة</p>
                          <p className="text-2xl font-black text-slate-900">10 <span className="text-xs opacity-50">{showPODraft.item.unit}</span></p>
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السعر المرجعي (HT)</p>
                          <p className="text-2xl font-black text-blue-600 font-mono">{showPODraft.price.toLocaleString()} DH</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <button 
                       onClick={() => handleSendDraftPO(showPODraft)}
                       className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 text-sm active:scale-95"
                    >
                       <Send size={24} /> إرسال للمزود (WhatsApp / Email)
                    </button>
                    <button onClick={() => setShowPODraft(null)} className="w-full bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest">إلغاء الطلب</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
