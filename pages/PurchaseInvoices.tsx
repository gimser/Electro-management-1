import React, { useState } from 'react';
import { AppState, Document, DocType, LineItem, InventoryItem, StockMovement } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, Plus, Search, Trash2, Save, X, 
  Package, ShoppingBag, DollarSign, Calendar, 
  ArrowUpRight, History, CheckCircle2, AlertCircle,
  PlusCircle, Calculator, FileText, Zap, Edit3
} from 'lucide-react';
import { generateSmartDocNumber, createRecord } from '../db';

interface PurchaseInvoicesProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

// Extended interface for local state to handle selling price and new items
interface PurchaseLineItem extends LineItem {
  sellingPrice?: number; // New field for inventory update
  isManual?: boolean;    // Flag to identify new items
}

const PurchaseInvoices: React.FC<PurchaseInvoicesProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    providerName: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as PurchaseLineItem[],
    notes: ''
  });

  const [showInventoryPicker, setShowInventoryPicker] = useState(false);

  const purchaseInvoices = state.documents.filter(d => d.type === DocType.ACHAT);

  // 1. Add Existing Item from Inventory
  const addItemToInvoice = (item: InventoryItem) => {
    const newLineItem: PurchaseLineItem = {
      id: crypto.randomUUID(),
      inventoryId: item.id,
      description: item.name,
      quantity: 1,
      unitPrice: item.purchasePrice,
      sellingPrice: item.sellingPrice, // Load current selling price
      total: item.purchasePrice,
      isManual: false
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newLineItem] }));
    setShowInventoryPicker(false);
  };

  // 2. Add Manual Item (New Product)
  const addManualItem = () => {
    const newLineItem: PurchaseLineItem = {
      id: crypto.randomUUID(),
      description: '', // Empty for user input
      quantity: 1,
      unitPrice: 0,
      sellingPrice: 0,
      total: 0,
      isManual: true
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newLineItem] }));
  };

  const updateItem = (id: string, field: keyof PurchaseLineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => {
        if (i.id === id) {
          const updated = { ...i, [field]: value };
          // Recalculate total if qty or price changes
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
          }
          return updated;
        }
        return i;
      })
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const subtotal = formData.items.reduce((acc, i) => acc + i.total, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('يرجى إضافة سلع للفاتورة');
    if (formData.items.some(i => !i.description)) return alert('يرجى إدخال اسم السلعة لجميع الأسطر');

    const invoiceNumber = generateSmartDocNumber('PUR', purchaseInvoices.length);
    
    // Clean items for the Document object (remove local extra fields if needed, but keeping them is safe)
    const docItems: LineItem[] = formData.items.map(i => ({
      id: i.id,
      inventoryId: i.inventoryId,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total
    }));

    const newDoc = createRecord<Document>({
      clientId: 'INTERNAL',
      providerName: formData.providerName,
      type: DocType.ACHAT,
      number: invoiceNumber,
      date: formData.date,
      items: docItems,
      subtotal,
      tvaAmount: 0,
      total: subtotal,
      status: 'Paid',
      notes: formData.notes
    });

    // --- AUTOMATION LOGIC ---
    updateState(prev => {
      let updatedInventory = [...prev.inventory];
      let newMovements: StockMovement[] = [...prev.stockMovements];
      let activityDetails: string[] = [];

      formData.items.forEach(item => {
        if (item.inventoryId && !item.isManual) {
          // A. Update Existing Item
          updatedInventory = updatedInventory.map(inv => {
            if (inv.id === item.inventoryId) {
              return { 
                ...inv, 
                quantity: inv.quantity + item.quantity,
                purchasePrice: item.unitPrice, // Update Cost
                sellingPrice: item.sellingPrice || inv.sellingPrice // Update Selling Price if provided
              };
            }
            return inv;
          });
        } else {
          // B. Create New Item (From Manual Entry)
          const newItem = createRecord<InventoryItem>({
            name: item.description,
            sku: `AUTO-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*100)}`,
            category: 'General', // Default category
            quantity: item.quantity,
            unit: 'pcs',
            purchasePrice: item.unitPrice,
            sellingPrice: item.sellingPrice || (item.unitPrice * 1.3), // Default margin if 0
            minStock: 5
          });
          updatedInventory.push(newItem);
          activityDetails.push(item.description);
          
          // Link the document item to this new inventory item for future reference
          item.inventoryId = newItem.id; 
        }

        // Create Stock Movement Log
        newMovements.unshift(createRecord<StockMovement>({
          inventoryId: item.inventoryId || 'UNKNOWN',
          type: 'IN',
          quantity: item.quantity,
          date: formData.date,
          reason: `مشتريات: ${formData.providerName}`,
          performedBy: 'System-Auto',
          referenceId: newDoc.id
        }));
      });

      return {
        ...prev,
        documents: [newDoc, ...prev.documents],
        inventory: updatedInventory,
        stockMovements: newMovements,
        automationLogs: [createRecord({
           action: 'PURCHASE_AUTO_STOCKING',
           status: 'success',
           details: `تم معالجة فاتورة الشراء ${invoiceNumber}. تم تحديث/إنشاء ${formData.items.length} أصناف في المخزن.`,
           timestamp: new Date().toISOString(),
           username: authUser?.fullName || 'System'
        }), ...(prev.automationLogs || [])]
      };
    });

    setShowForm(false);
    setFormData({ providerName: '', date: new Date().toISOString().split('T')[0], items: [], notes: '' });
    alert('تم حفظ الفاتورة وتحديث المخزن (وإضافة الأصناف الجديدة) بنجاح!');
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
            <div className="bg-white rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
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
                        <div className="flex gap-2">
                            <button 
                               type="button"
                               onClick={addManualItem}
                               className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-slate-100 transition-all"
                            >
                               <Edit3 size={14} /> إضافة سطر يدوي (جديد)
                            </button>
                            <button 
                               type="button"
                               onClick={() => setShowInventoryPicker(true)}
                               className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
                            >
                               <PlusCircle size={16} /> اختيار من المخزن
                            </button>
                        </div>
                     </div>
                     <div className="p-0">
                        <table className="w-full text-right">
                           <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase">
                                 <th className="px-6 py-3 w-1/3">السلعة</th>
                                 <th className="px-6 py-3 text-center">الكمية</th>
                                 <th className="px-6 py-3 text-center text-blue-600">ثمن الشراء HT</th>
                                 <th className="px-6 py-3 text-center text-green-600">ثمن البيع (للمخزن)</th>
                                 <th className="px-6 py-3 text-left">المجموع (HT)</th>
                                 <th className="w-10"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {formData.items.map(item => (
                                 <tr key={item.id} className="text-sm font-bold text-slate-700">
                                    <td className="px-6 py-4">
                                        {item.isManual ? (
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:border-blue-500 outline-none"
                                                placeholder="اسم السلعة الجديدة..."
                                                value={item.description}
                                                onChange={e => updateItem(item.id, 'description', e.target.value)}
                                            />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Package size={14} className="text-slate-400"/> {item.description}
                                            </span>
                                        )}
                                        {item.isManual && <span className="text-[8px] text-blue-500 block mt-1 font-black">* سيتم إضافته للمخزن تلقائياً</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                       <input 
                                          type="number" 
                                          min="1" 
                                          className="w-20 bg-slate-100 border-none rounded-lg text-center font-black p-2 outline-none focus:ring-2 focus:ring-blue-200"
                                          value={item.quantity} 
                                          onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} 
                                       />
                                    </td>
                                    <td className="px-6 py-4">
                                       <input 
                                          type="number" 
                                          step="0.01"
                                          className="w-28 bg-slate-100 border-none rounded-lg text-center font-black p-2 font-mono text-blue-700 outline-none focus:ring-2 focus:ring-blue-200"
                                          value={item.unitPrice} 
                                          onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} 
                                       />
                                    </td>
                                    <td className="px-6 py-4">
                                       <input 
                                          type="number" 
                                          step="0.01"
                                          className="w-28 bg-white border-2 border-green-100 rounded-lg text-center font-black p-2 font-mono text-green-700 outline-none focus:border-green-500"
                                          value={item.sellingPrice || 0} 
                                          onChange={e => updateItem(item.id, 'sellingPrice', parseFloat(e.target.value))} 
                                          placeholder="0.00"
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
                                    <td colSpan={6} className="py-16 text-center text-slate-400 italic text-xs border-dashed">
                                        <p>القائمة فارغة.</p>
                                        <p className="mt-2">استخدم الأزرار أعلاه لإضافة سلع من المخزن أو إدخال سلع جديدة يدوياً.</p>
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="flex justify-between items-end bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                     <div className="w-1/2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">ملاحظات إضافية</label>
                        <textarea rows={2} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-bold resize-none shadow-inner outline-none focus:border-blue-500" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                     </div>
                     <div className="text-left space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">صافي الفاتورة (HT)</p>
                        <p className="text-4xl font-black text-blue-900 font-mono tracking-tighter">{subtotal.toLocaleString()} <span className="text-lg">DH</span></p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-6 rounded-[2rem]">
                     <AlertCircle className="text-amber-600 shrink-0" size={24} />
                     <p className="text-xs font-bold text-amber-800 leading-relaxed">
                        بمجرد الحفظ، سيقوم النظام بـ: <br/>
                        1. تحديث الكميات وثمن الشراء والبيع للأصناف الموجودة.<br/>
                        2. إنشاء "كرت صنف" جديد تلقائياً للأصناف اليدوية وإضافتها للمخزن.
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
                     <button key={item.id} onClick={() => addItemToInvoice(item)} className="w-full text-right p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all flex justify-between items-center group">
                        <div>
                           <p className="font-black text-slate-800 group-hover:text-blue-700 transition-colors">{item.name}</p>
                           <p className="text-[10px] font-bold text-slate-400">SKU: {item.sku}</p>
                        </div>
                        <div className="text-left">
                           <p className="text-xs font-black text-blue-600">المخزون: {item.quantity}</p>
                           <span className="text-[8px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">إضافة</span>
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