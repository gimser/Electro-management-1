import React, { useState, useEffect } from 'react';
import { AppState, DocType, Document, LineItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Save, X, Calculator, ShieldCheck, Building2, FileText, Ban } from 'lucide-react';
import { generateDocNumber, createCheckpoint, createRecord } from '../db';

interface DocumentFormProps {
  initialType: DocType;
  editingDoc: Document | null;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onCancel: () => void;
  onSave: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ initialType, editingDoc, state, updateState, onCancel, onSave }) => {
  const { user: authUser } = useAuth();
  const [docType, setDocType] = useState<DocType>(editingDoc?.type || initialType);
  const [clientId, setClientId] = useState(editingDoc?.clientId || '');
  const [items, setItems] = useState<LineItem[]>(editingDoc?.items || []);
  const [notes, setNotes] = useState(editingDoc?.notes || '');
  const [applyTva, setApplyTva] = useState(true); // Default to true for SARL

  // Corporate Logic: No Limits
  const currentYear = new Date().getFullYear();

  const calculateTotals = () => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0); // Total HT
    const tvaAmount = applyTva ? subtotal * 0.20 : 0;
    const total = subtotal + tvaAmount; // Total TTC
    return { subtotal, tvaAmount, total };
  };

  const { subtotal, tvaAmount, total } = calculateTotals();

  const addItem = () => {
    const newItem: LineItem = { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 };
    setItems([...items, newItem]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return alert('الرجاء اختيار زبون');

    const docCount = state.documents.filter(d => d.type === docType).length;
    
    // Create new document with SARL standards
    let docData: Document;
    
    if (editingDoc) {
      docData = {
        ...editingDoc,
        clientId,
        type: docType,
        items,
        subtotal,
        tvaAmount,
        total,
        notes,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
        version: editingDoc.version + 1
      };
    } else {
      docData = createRecord<Document>({
        clientId,
        type: docType,
        number: generateDocNumber(docType, docCount),
        date: new Date().toISOString().split('T')[0],
        items,
        subtotal,    // HT
        tvaAmount,   // VAT
        total,       // TTC
        status: 'Draft',
        notes,
        paidAmount: 0
      });
    }

    // --- MANUAL SNAPSHOT BEFORE SAVING DOC ---
    await createCheckpoint(state, `Before Invoice: ${docData.number}`);

    updateState(prev => ({
      ...prev,
      documents: editingDoc ? prev.documents.map(d => d.id === editingDoc.id ? docData : d) : [...prev.documents, docData],
      activityLogs: [createRecord({
        userId: authUser?.id || 'system',
        username: authUser?.fullName || 'System',
        action: 'CORPORATE_DOC_SAVED',
        module: 'FINANCE',
        timestamp: new Date().toISOString(),
        details: `إنشاء/تعديل وثيقة تجارية ${docData.number} بقيمة ${total.toLocaleString()} DH TTC`,
        severity: 'Info'
      }), ...(prev.activityLogs || [])]
    }));
    onSave();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 text-right" dir="rtl">
      
      <div className="mb-8 bg-slate-900 border-2 border-slate-800 p-6 rounded-3xl flex items-center justify-between text-white shadow-xl">
         <div className="flex items-center gap-4">
            <Building2 className="text-blue-400" size={32} />
            <div>
               <h3 className="text-lg font-black uppercase tracking-tighter">النظام المالي للشركات (SARL)</h3>
               <p className="text-xs font-bold text-slate-400">يتم تطبيق ضريبة القيمة المضافة (20%) تلقائياً وفقاً للقانون.</p>
            </div>
         </div>
         <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
            <ShieldCheck size={16} className="text-green-400" />
            <span className="text-[10px] font-black uppercase">Tax Compliant</span>
         </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800">إنشاء وثيقة تجارية رسمية</h2>
        <div className="flex gap-4">
          <button onClick={onCancel} className="bg-white text-slate-500 px-6 py-3 rounded-2xl font-black border border-slate-200 hover:bg-slate-50 transition-all">إلغاء</button>
          <button 
             onClick={handleSubmit} 
             className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Save size={18} /> حفظ وتصديق
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">الزبون (شخص معنوي أو ذاتي)</label>
               <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={clientId} onChange={e => setClientId(e.target.value)}>
                  <option value="">-- اختر الزبون --</option>
                  {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">نوع المستند</label>
               <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={docType} onChange={e => setDocType(e.target.value as DocType)}>
                  <option value={DocType.DEVIS}>عرض ثمن (Devis)</option>
                  <option value={DocType.FACTURE}>فاتورة (Facture)</option>
               </select>
            </div>
         </div>

         <div className="border-2 border-slate-50 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-right">
               <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase">
                     <th className="px-8 py-4">الخدمة / المنتج</th>
                     <th className="px-8 py-4 text-center">الكمية</th>
                     <th className="px-8 py-4 text-center">P.U (HT)</th>
                     <th className="px-8 py-4 text-left">الإجمالي (HT)</th>
                     <th className="w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {items.map(item => (
                     <tr key={item.id}>
                        <td className="px-8 py-4"><input className="w-full bg-transparent font-bold text-slate-700 outline-none" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="وصف الخدمة..." /></td>
                        <td className="px-8 py-4 text-center"><input type="number" className="w-20 bg-slate-50 rounded-lg text-center font-black p-1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} /></td>
                        <td className="px-8 py-4 text-center"><input type="number" className="w-24 bg-slate-50 rounded-lg text-center font-black p-1" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} /></td>
                        <td className="px-8 py-4 text-left font-black text-slate-900 font-mono">{item.total.toLocaleString()}</td>
                        <td className="px-8 py-4 text-center"><button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500">×</button></td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <button onClick={addItem} className="w-full py-4 bg-slate-50 text-slate-500 font-black text-[10px] uppercase hover:bg-slate-100 transition-all border-t border-slate-100">+ إضافة بند جديد</button>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-end p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
            <div className="space-y-4 w-full md:w-1/2">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={applyTva} onChange={e => setApplyTva(e.target.checked)} className="w-5 h-5 rounded-lg text-blue-600 focus:ring-0" />
                  <span className="text-xs font-black text-slate-700 uppercase">تطبيق ضريبة القيمة المضافة (TVA 20%)</span>
               </label>
               <textarea 
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold resize-none h-24 outline-none focus:border-blue-500"
                  placeholder="شروط الدفع أو ملاحظات إضافية..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
               />
            </div>
            
            <div className="space-y-3 min-w-[250px] mt-6 md:mt-0">
               <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>المجموع (HT):</span>
                  <span className="font-mono">{subtotal.toLocaleString()} DH</span>
               </div>
               <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>قيمة الضريبة (20%):</span>
                  <span className="font-mono">{tvaAmount.toLocaleString()} DH</span>
               </div>
               <div className="h-px bg-slate-300 my-2"></div>
               <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-slate-800 uppercase">الإجمالي (TTC):</span>
                  <span className="text-3xl font-black text-blue-600 font-mono tracking-tighter">{total.toLocaleString()} <span className="text-sm">DH</span></span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DocumentForm;