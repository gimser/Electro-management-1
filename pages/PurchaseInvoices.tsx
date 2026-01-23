
import React, { useState } from 'react';
import { AppState, Document, DocType, LineItem, InventoryItem, StockMovement } from '../types';
// Added Zap to the imports from lucide-react
import { 
  Truck, Plus, Search, Trash2, Save, X, 
  Package, ShoppingBag, DollarSign, Calendar, 
  ArrowUpRight, History, CheckCircle2, AlertCircle,
  PlusCircle, Calculator, FileText, Zap
} from 'lucide-react';
import { generateSmartDocNumber } from '../db';

interface PurchaseInvoicesProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const PurchaseInvoices: React.FC<PurchaseInvoicesProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    providerName: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as LineItem[],
    notes: ''
  });

  const [showInventoryPicker, setShowInventoryPicker] = useState(false);

  const purchaseInvoices = state.documents.filter(d => d.type === DocType.ACHAT);

  const addItemToInvoice = (item: InventoryItem) => {
    const newLineItem: LineItem = {
      id: crypto.randomUUID(),
      inventoryId: item.id,
      description: item.name,
      quantity: 1,
      unitPrice: item.purchasePrice,
      total: item.purchasePrice
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newLineItem] }));
    setShowInventoryPicker(false);
  };

  const updateItemQty = (id: string, qty: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, quantity: qty, total: qty * i.unitPrice } : i)
    }));
  };

  const updateItemPrice = (id: string, price: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, unitPrice: price, total: i.quantity * price } : i)
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const subtotal = formData.items.reduce((acc, i) => acc + i.total, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('يرجى إضافة سلع للفاتورة');

    const invoiceNumber = generateSmartDocNumber('PUR', purchaseInvoices.length);
    const newDoc: Document = {
      id: crypto.randomUUID(),
      clientId: 'INTERNAL', // المشتريات داخلية
      providerName: formData.providerName,
      type: DocType.ACHAT,
      number: invoiceNumber,
      date: formData.date,
      items: formData.items,
      subtotal,
      tva: 20,
      total: subtotal * 1.2,
      status: 'Paid',
      notes: formData.notes
    };

    // --- منطق الأتمتة المهندس (Engineered Automation) ---
    updateState(prev => {
      let updatedInventory = [...prev.inventory];
      let newMovements: StockMovement[] = [...prev.stockMovements];

      formData.items.forEach(item => {
        if (item.inventoryId) {
          // 1. تحديث الكمية وسعر الشراء في المخزن
          updatedInventory = updatedInventory.map(inv => {
            if (inv.id === item.inventoryId) {
              return { 
                ...inv, 
                quantity: inv.quantity + item.quantity,
                purchasePrice: item.unitPrice // تحديث لآخر سعر شراء
              };
            }
            return inv;
          });

          // 2. إنشاء سجل حركة مخزن
          newMovements.unshift({
            id: crypto.randomUUID(),
            inventoryId: item.inventoryId,
            type: 'IN',
            quantity: item.quantity,
            date: formData.date,
            reason: `مشتريات من: ${formData.providerName}`,
            performedBy: 'System-Auto',
            referenceId: newDoc.id
          });
        }
      });

      return {
        ...prev,
        documents: [newDoc, ...prev.documents],
        inventory: updatedInventory,
        stockMovements: newMovements,
        automationLogs: [{
           id: crypto.randomUUID(),
           timestamp: new Date().toISOString(),
           action: 'PURCHASE_AUTO_STOCKING',
           status: 'success',
           details: `تم إضافة سلع الفاتورة ${invoiceNumber} للمخزن آلياً وتحديث الأثمنة.`
        }, ...(prev.automationLogs || [])]
      };
    });

    setShowForm(false);
    setFormData({ providerName: '', date: new Date().toISOString().split('T')[0], items: [], notes: '' });
    alert('تم حفظ الفاتورة وتغذية المخزن بنجاح!');
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Truck className="text-blue-600" size={32} /> فواتير المشتريات (Inbound Logistics)
          </h2>
          <p className="text-slate-500 font-medium">تسجيل فواتير المزودين وتغذية المخزن آلياً بالقطع والسلع</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} /> تسجيل فاتورة شراء
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المشتريات</p>
            <p className="text-3xl font-black text-slate-800 font-mono">
               {purchaseInvoices.reduce((acc, d) => acc + d.total, 0).toLocaleString()} <span className="text-sm">DH</span>
            </p>
         </div>
         <div className="bg-blue-900 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">تغذية المخزن</p>
               <p className="text-xl font-black uppercase">الربط الآلي نشط</p>
            </div>
            {/* Added Zap to the components */}
            <Zap className="text-amber-400 fill-amber-400" size={32} />
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div className="relative max-w-md w-full">
               <Search className="absolute right-4 top-3 text-slate-400" size={18} />
               <input 
                  className="w-full pr-12 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none text-sm" 
                  placeholder="بحث برقم الفاتورة أو المزود..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-right">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">المرجع / المزود</th>
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">التاريخ</th>
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">عدد الأصناف</th>
                     <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">المبلغ الإجمالي</th>
                     <th className="px-8 py-4 w-20"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {purchaseInvoices.filter(d => d.number.includes(search) || d.providerName?.includes(search)).map(doc => (
                     <tr key={doc.id} className="hover:bg-blue-50/20 transition-all group">
                        <td className="px-8 py-5">
                           <p className="font-black text-slate-800 text-sm">{doc.number}</p>
                           <p className="text-[10px] text-blue-600 font-bold uppercase">{doc.providerName}</p>
                        </td>
                        <td className="px-8 py-5 text-center text-xs font-bold text-slate-500">{doc.date}</td>
                        <td className="px-8 py-5 text-center">
                           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black">{doc.items.length} قطع</span>
                        </td>
                        <td className="px-8 py-5 text-left font-black text-slate-900 font-mono">{doc.total.toLocaleString()} DH</td>
                        <td className="px-8 py-5 text-left">
                           <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><FileText size={18}/></button>
                        </td>
                     </tr>
                  ))}
                  {purchaseInvoices.length === 0 && (
                     <tr>
                        <td colSpan={5} className="py-20 text-center opacity-30">
                           <ShoppingBag size={48} className="mx-auto mb-2" />
                           <p className="font-black text-sm uppercase">لا توجد فواتير مشتريات مسجلة</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal: New Purchase Invoice Form */}
      {showForm && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
               <div className="p-8 bg-blue-900 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-4">
                     <Truck size={28} className="text-blue-300" />
                     <h3 className="text-2xl font-black tracking-tighter uppercase">تسجيل فاتورة توريد جديدة</h3>
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white transition-all"><X size={32} /></button>
               </div>

               <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم المزود / الشركة</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="مثال: Hikvision Morocco..." value={formData.providerName} onChange={e => setFormData({...formData, providerName: e.target.value})} />
                     </div>
                     <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ الفاتورة</label>
                        <input type="date" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                     </div>
                  </div>

                  <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                     <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                           <Package size={18} className="text-blue-600" /> السلع المشتراة
                        </h4>
                        <button 
                           type="button"
                           onClick={() => setShowInventoryPicker(true)}
                           className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
                        >
                           <PlusCircle size={16} /> اختيار من المخزن الحالي
                        </button>
                     </div>
                     <div className="p-0">
                        <table className="w-full text-right">
                           <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase">
                                 <th className="px-6 py-3">السلعة</th>
                                 <th className="px-6 py-3 text-center">الكمية</th>
                                 <th className="px-6 py-3 text-center">ثمن الشراء HT</th>
                                 <th className="px-6 py-3 text-left">المجموع</th>
                                 <th className="w-16"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {formData.items.map(item => (
                                 <tr key={item.id} className="text-sm font-bold text-slate-700">
                                    <td className="px-6 py-4">{item.description}</td>
                                    <td className="px-6 py-4">
                                       <input 
                                          type="number" 
                                          min="1" 
                                          className="w-20 bg-slate-100 border-none rounded-lg text-center font-black p-1"
                                          value={item.quantity} 
                                          onChange={e => updateItemQty(item.id, parseInt(e.target.value))} 
                                       />
                                    </td>
                                    <td className="px-6 py-4">
                                       <input 
                                          type="number" 
                                          step="0.01"
                                          className="w-24 bg-slate-100 border-none rounded-lg text-left font-black p-1 font-mono"
                                          value={item.unitPrice} 
                                          onChange={e => updateItemPrice(item.id, parseFloat(e.target.value))} 
                                       />
                                    </td>
                                    <td className="px-6 py-4 text-left font-black font-mono">{item.total.toLocaleString()} DH</td>
                                    <td className="px-6 py-4 text-left">
                                       <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                                    </td>
                                 </tr>
                              ))}
                              {formData.items.length === 0 && (
                                 <tr>
                                    <td colSpan={5} className="py-10 text-center text-slate-400 italic text-xs">يرجى إضافة السلع المستلمة...</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="flex justify-between items-end bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                     <div className="w-1/2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">ملاحظات إضافية</label>
                        <textarea rows={2} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-bold resize-none shadow-inner" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                     </div>
                     <div className="text-left space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">صافي الفاتورة (HT)</p>
                        <p className="text-4xl font-black text-blue-900 font-mono tracking-tighter">{subtotal.toLocaleString()} <span className="text-lg">DH</span></p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-6 rounded-[2rem]">
                     <AlertCircle className="text-amber-600 shrink-0" size={24} />
                     <p className="text-xs font-bold text-amber-800 leading-relaxed">
                        بمجرد الحفظ، سيقوم النظام بزيادة الكميات في المخزن آلياً وتغيير ثمن الشراء لآخر قيمة مسجلة لضمان حساب أرباح دقيق.
                     </p>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 text-lg active:scale-[0.98]">
                     <Save size={24} /> تأكيد وحفظ الفاتورة (تحديث المخزن)
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* Inventory Picker for Purchase */}
      {showInventoryPicker && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-xl h-[70vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase">اختيار من المخزن</h3>
                  <button onClick={() => setShowInventoryPicker(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {state.inventory.map(item => (
                     <button key={item.id} onClick={() => addItemToInvoice(item)} className="w-full text-right p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all flex justify-between items-center">
                        <div>
                           <p className="font-black text-slate-800">{item.name}</p>
                           <p className="text-[10px] font-bold text-slate-400">SKU: {item.sku}</p>
                        </div>
                        <div className="text-left">
                           <p className="text-xs font-black text-blue-600">المخزون الحالي: {item.quantity}</p>
                           <span className="text-[8px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">اضغط للإضافة</span>
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

export default PurchaseInvoices;
