
import React, { useState, useEffect } from 'react';
import { AppState, DocType, Document, LineItem } from '../types';
import { Plus, Trash2, Save, X, Calculator, PlusCircle } from 'lucide-react';
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
  const [docType, setDocType] = useState<DocType>(editingDoc?.type || initialType);
  const [clientId, setClientId] = useState(editingDoc?.clientId || '');
  const [items, setItems] = useState<LineItem[]>(editingDoc?.items || []);
  const [notes, setNotes] = useState(editingDoc?.notes || '');
  const [status, setStatus] = useState<Document['status']>(editingDoc?.status || 'Draft');
  const [interventionDetails, setInterventionDetails] = useState(editingDoc?.interventionDetails || '');
  const [warrantyPeriod, setWarrantyPeriod] = useState(editingDoc?.warrantyPeriod || '');

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
      alert('الرجاء اختيار زبون');
      return;
    }

    const docCount = state.documents.filter(d => d.type === docType).length;
    
    const docData: Document = {
      id: editingDoc?.id || crypto.randomUUID(),
      clientId,
      type: docType,
      number: editingDoc?.number || generateDocNumber(docType, docCount),
      date: editingDoc?.date || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      tva: 20,
      total,
      status,
      notes,
      interventionDetails,
      warrantyPeriod
    };

    updateState(prev => ({
      ...prev,
      documents: editingDoc 
        ? prev.documents.map(d => d.id === editingDoc.id ? docData : d)
        : [...prev.documents, docData]
    }));
    
    onSave();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {editingDoc ? `تعديل ${docType}` : `إنشاء ${docType} جديد`}
          </h2>
          <p className="text-slate-500">قم بتعبئة المعلومات الأساسية للوثيقة</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all">إلغاء</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save size={18} /> حفظ الوثيقة
          </button>
        </div>
      </div>

      <form className="space-y-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">معلومات عامة</h3>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">الزبون *</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">اختر الزبون...</option>
                {state.clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.ice})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">نوع الوثيقة</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                >
                  <option value={DocType.DEVIS}>عرض ثمن (Devis)</option>
                  <option value={DocType.FACTURE}>فاتورة (Facture)</option>
                  <option value={DocType.CONTRAT}>عقد صيانة (Contrat)</option>
                  <option value={DocType.GARANTIE}>شهادة ضمان</option>
                  <option value={DocType.RAPPORT}>تقرير تدخل</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الحالة</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Draft">مسودة (Draft)</option>
                  <option value="Sent">تم الإرسال (Sent)</option>
                  <option value="Paid">مدفوع (Paid)</option>
                  <option value="Cancelled">ملغى (Cancelled)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Extra Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">تفاصيل إضافية</h3>
            {docType === DocType.RAPPORT ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">تفاصيل التدخل التقني</label>
                <textarea 
                  rows={4}
                  placeholder="وصف المشكلة، الحل المقترح، والقطع المستخدمة..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                  value={interventionDetails}
                  onChange={(e) => setInterventionDetails(e.target.value)}
                />
              </div>
            ) : docType === DocType.GARANTIE ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">فترة الضمان (مثلاً: 12 شهراً)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ملاحظات عامة</label>
                <textarea 
                  rows={4}
                  placeholder="ملاحظات تظهر في أسفل الوثيقة..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">تفاصيل الخدمات والمنتجات</h3>
            <button 
              type="button"
              onClick={addItem}
              className="text-blue-600 font-bold flex items-center gap-1 hover:underline"
            >
              <PlusCircle size={18} /> إضافة بند
            </button>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">الوصف / البيان</th>
                  <th className="px-6 py-3 w-32">الكمية</th>
                  <th className="px-6 py-3 w-40">ثمن الوحدة (DH)</th>
                  <th className="px-6 py-3 w-40">المجموع (HT)</th>
                  <th className="px-6 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <input 
                        className="w-full px-3 py-1.5 border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md outline-none transition-all text-sm"
                        placeholder="وصف الخدمة أو المنتج..."
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number"
                        min="1"
                        className="w-full px-3 py-1.5 border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md outline-none transition-all text-center text-sm font-mono"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number"
                        className="w-full px-3 py-1.5 border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md outline-none transition-all text-left text-sm font-mono"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-3 text-left font-bold text-sm font-mono">
                      {item.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic">لا توجد بنود حالياً. اضغط على "إضافة بند" للبدء.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>المجموع الصافي (HT):</span>
                <span className="font-mono">{subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-slate-600 text-sm">
                <span>الضريبة (TVA 20%):</span>
                <span className="font-mono">{(subtotal * 0.2).toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black border-t border-slate-200 pt-2 text-lg">
                <span>المجموع الكلي:</span>
                <span className="font-mono text-blue-600">{total.toFixed(2)} DH</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;
