
import React, { useState, useEffect } from 'react';
import { AppState, DocType, Document, LineItem, InventoryItem } from '../types';
import { Plus, Trash2, Save, X, Calculator, PlusCircle, HardHat, Package, Search } from 'lucide-react';
import { generateDocNumber } from '../db';

interface DocumentFormProps {
  initialType: DocType;
  editingDoc: Document | null;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onCancel: () => void;
  onSave: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ initialType, editingDoc, state, updateState, onCancel, onSave }) => {
  const isRTL = state.settings.language === 'ar';
  
  const [docType, setDocType] = useState<DocType>(editingDoc?.type || initialType);
  const [clientId, setClientId] = useState(editingDoc?.clientId || '');
  const [items, setItems] = useState<LineItem[]>(editingDoc?.items || []);
  const [notes, setNotes] = useState(editingDoc?.notes || '');
  const [status, setStatus] = useState<Document['status']>(editingDoc?.status || 'Draft');
  const [interventionDetails, setInterventionDetails] = useState(editingDoc?.interventionDetails || '');
  const [warrantyPeriod, setWarrantyPeriod] = useState(editingDoc?.warrantyPeriod || '');
  const [assignedTech, setAssignedTech] = useState('');
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const total = subtotal * 1.2; // 20% TVA

  const addItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const addFromInventory = (inv: InventoryItem) => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      inventoryId: inv.id,
      description: inv.name,
      quantity: 1,
      unitPrice: inv.sellingPrice,
      total: inv.sellingPrice
    };
    setItems([...items, newItem]);
    setShowInventoryPicker(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert(isRTL ? 'الرجاء اختيار زبون' : 'Please select a client');
      return;
    }

    const docCount = state.documents.filter(d => d.type === docType).length;
    const docId = editingDoc?.id || crypto.randomUUID();
    const docNumber = editingDoc?.number || generateDocNumber(docType, docCount);

    const docData: Document = {
      id: docId,
      clientId,
      type: docType,
      number: docNumber,
      date: editingDoc?.date || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      tva: 20,
      total,
      status,
      notes: assignedTech ? `${notes}\n\n[Assigned Tech: ${assignedTech}]` : notes,
      interventionDetails,
      warrantyPeriod
    };

    updateState(prev => {
      // Inventory Deduction Logic if status is Paid and not previously paid
      let newInventory = [...prev.inventory];
      let newMovements = [...(prev.stockMovements || [])];

      if (status === 'Paid' && (!editingDoc || editingDoc.status !== 'Paid')) {
        items.forEach(item => {
           if (item.inventoryId) {
              newInventory = newInventory.map(i => i.id === item.inventoryId ? { ...i, quantity: i.quantity - item.quantity } : i);
              newMovements.unshift({
                 id: crypto.randomUUID(),
                 inventoryId: item.inventoryId,
                 type: 'OUT',
                 quantity: item.quantity,
                 date: new Date().toISOString().split('T')[0],
                 reason: `Sold in Invoice ${docNumber}`,
                 performedBy: 'admin',
                 referenceId: docId
              });
           }
        });
      }

      return {
        ...prev,
        inventory: newInventory,
        stockMovements: newMovements,
        documents: editingDoc 
          ? prev.documents.map(d => d.id === editingDoc.id ? docData : d)
          : [...prev.documents, docData],
        automationLogs: status === 'Paid' ? [{
           id: crypto.randomUUID(),
           timestamp: new Date().toISOString(),
           action: 'STOCK_DEDUCTED',
           status: 'success',
           details: `تم خصم سلع الفاتورة ${docNumber} من المخزن آلياً.`
        }, ...(prev.automationLogs || [])] : prev.automationLogs
      };
    });
    
    onSave();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {editingDoc ? `تعديل ${docType}` : `إنشاء ${docType}`}
          </h2>
          <p className="text-slate-500 font-medium">تجهيز وثيقة تجارية مع ربط السلع المستعملة بالمخزن</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-black hover:bg-slate-200 transition-all border border-slate-200 uppercase text-xs tracking-widest">إلغاء</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-100 uppercase text-xs tracking-widest">
            <Save size={18} /> حفظ وتفعيل الوثيقة
          </button>
        </div>
      </div>

      <form className="space-y-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 border-b border-slate-50 pb-4 mb-2 uppercase text-xs tracking-widest flex items-center gap-2 text-blue-600">
              <Calculator size={18} /> البيانات التجارية
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الزبون المستهدف</label>
                <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">اختر الزبون...</option>
                  {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">نوع الوثيقة</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={docType} onChange={(e) => setDocType(e.target.value as DocType)}>
                    <option value={DocType.DEVIS}>عرض ثمن (Devis)</option>
                    <option value={DocType.FACTURE}>فاتورة (Facture)</option>
                    <option value={DocType.RAPPORT}>تقرير تدخل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الحالة</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid (خصم آلي للمخزن)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 border-b border-slate-50 pb-4 mb-2 uppercase text-xs tracking-widest flex items-center gap-2 text-indigo-600">
              <HardHat size={18} /> الربط الميداني
            </h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">التقني المسؤول</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={assignedTech} onChange={(e) => setAssignedTech(e.target.value)}>
                    <option value="">غير محدد...</option>
                    {state.technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">ملاحظات المستند</label>
                  <textarea rows={4} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">بنود الخدمات والقطع</h3>
            <div className="flex gap-2">
               <button type="button" onClick={() => setShowInventoryPicker(true)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                 <Package size={16} /> استيراد من المخزن
               </button>
               <button type="button" onClick={addItem} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-50">
                 <PlusCircle size={16} /> إضافة بند يدوي
               </button>
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">الوصف / القطعة</th>
                  <th className="px-8 py-4 w-32 text-center">الكمية</th>
                  <th className="px-8 py-4 w-44">ثمن الوحدة (DH)</th>
                  <th className="px-8 py-4 w-44">المجموع (HT)</th>
                  <th className="px-8 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                         {item.inventoryId && <Package size={14} className="text-blue-500" />}
                         <input className="w-full bg-transparent border-none font-bold text-slate-700" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <input type="number" min="1" className="w-full text-center font-black font-mono text-slate-700 bg-transparent" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))} />
                    </td>
                    <td className="px-8 py-4">
                      <input type="number" className="w-full text-left font-black font-mono text-slate-700 bg-transparent" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} />
                    </td>
                    <td className="px-8 py-4 text-left font-black text-slate-900 font-mono">
                      {item.total.toLocaleString('fr-FR')} <span className="text-[8px] text-slate-400">DH</span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <button type="button" onClick={() => removeItem(item.id)} className="text-slate-200 hover:text-red-500 p-2 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 italic font-bold">السلة فارغة. استخدم الأزرار أعلاه للبدء.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
                <span>Total HT:</span>
                <span className="font-mono text-sm">{subtotal.toLocaleString('fr-FR')} DH</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black border-t border-slate-200 pt-4 text-2xl tracking-tighter">
                <span>TOTAL TTC:</span>
                <span className="font-mono text-blue-600">{total.toLocaleString('fr-FR')} DH</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Inventory Picker Modal */}
      {showInventoryPicker && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl h-[70vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <h3 className="text-xl font-black">اختيار قطعة من المخزن</h3>
                  <button onClick={() => setShowInventoryPicker(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
               </div>
               <div className="p-6 border-b border-slate-100">
                  <div className="relative">
                     <Search className="absolute right-4 top-3 text-slate-400" size={18} />
                     <input className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="ابحث باسم القطعة..." />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {state.inventory.filter(i => i.quantity > 0).map(inv => (
                     <button key={inv.id} onClick={() => addFromInventory(inv)} className="w-full text-right p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all flex justify-between items-center group">
                        <div>
                           <p className="font-black text-slate-800">{inv.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المتوفر: {inv.quantity} {inv.unit}</p>
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-black text-blue-600 group-hover:scale-110 transition-transform">{inv.sellingPrice.toLocaleString('fr-FR')} DH</p>
                           <span className="text-[8px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">اضغط للاختيار</span>
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

export default DocumentForm;
