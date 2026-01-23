
import React, { useState } from 'react';
import { AppState, Document, DocType } from '../types';
import { Plus, Search, Trash2, Edit2, Eye, MessageCircle, FileDown, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateDocNumber } from '../db';

interface DocumentListProps {
  type: DocType;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onEdit: (doc: Document) => void;
  onPrint: (doc: Document) => void;
  onNew: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ type, state, updateState, onEdit, onPrint, onNew }) => {
  const [search, setSearch] = useState('');

  const documents = state.documents.filter(d => d.type === type);
  const filteredDocs = documents.filter(d => {
    const client = state.clients.find(c => c.id === d.clientId);
    return d.number.toLowerCase().includes(search.toLowerCase()) || 
           (client && client.name.toLowerCase().includes(search.toLowerCase()));
  });

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) {
      updateState(prev => ({
        ...prev,
        documents: prev.documents.filter(d => d.id !== id)
      }));
    }
  };

  const handleConvertToInvoice = (devis: Document) => {
    if (confirm('هل تريد تحويل عرض الثمن هذا إلى فاتورة رسمية؟')) {
      const invoiceCount = state.documents.filter(d => d.type === DocType.FACTURE).length;
      const newInvoice: Document = {
        ...devis,
        id: crypto.randomUUID(),
        type: DocType.FACTURE,
        number: generateDocNumber(DocType.FACTURE, invoiceCount),
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        paidAmount: 0,
        notes: `تحويل من عرض ثمن رقم: ${devis.number}`
      };
      
      updateState(prev => ({
        ...prev,
        documents: [...prev.documents, newInvoice]
      }));
      alert('تم تحويل عرض الثمن إلى فاتورة بنجاح. يمكنك العثور عليها في قسم الفواتير.');
    }
  };

  const handleWhatsApp = (doc: Document) => {
    const client = state.clients.find(c => c.id === doc.clientId);
    if (!client) return;
    
    const remaining = doc.total - (doc.paidAmount || 0);
    const message = `السلام عليكم ${client.name},\n\nتجدون رفقته تفاصيل الوثيقة الخاصة بشركة Electro GIM Services:\nالنوع: ${doc.type}\nالرقم: ${doc.number}\nالمبلغ الإجمالي: ${doc.total.toLocaleString()} DH\n${doc.status !== 'Paid' ? `المبلغ المتبقي للأداء: ${remaining.toLocaleString()} DH` : 'الحالة: مدفوعة بالكامل'}\n\nشكراً لثقتكم.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${client.phone.replace(/\s+/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Partially-Paid': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Sent': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Draft': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getDocName = () => {
    switch(type) {
      case DocType.DEVIS: return 'عروض الأثمان (Devis)';
      case DocType.FACTURE: return 'فواتير الزبائن (Factures)';
      case DocType.CONTRAT: return 'عقود الصيانة';
      case DocType.RAPPORT: return 'تقارير التدخل';
      case DocType.GARANTIE: return 'شهادات الضمان';
      default: return 'الوثائق';
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{getDocName()}</h2>
          <p className="text-slate-500 font-medium">إدارة وتتبع الوثائق التقنية والتجارية والمالية</p>
        </div>
        <button 
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 transition-all transform active:scale-95"
        >
          <Plus size={20} /> إنشاء {type} جديد
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث برقم الوثيقة أو اسم الزبون..." 
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">المعرف</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">الزبون المستهدف</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">التاريخ</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">المبلغ الصافي</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">الحالة</th>
                <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.length > 0 ? filteredDocs.slice().reverse().map((doc) => {
                const client = state.clients.find(c => c.id === doc.clientId);
                const isOverdue = doc.dueDate && new Date(doc.dueDate) < new Date() && doc.status !== 'Paid';
                return (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-black text-slate-800 text-sm">
                       {doc.number}
                       {isOverdue && <span className="mr-2 text-[8px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded flex items-center w-fit gap-1 mt-1 animate-pulse"><AlertCircle size={10} /> متأخرة</span>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800 text-sm">{client?.name || '---'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{client?.city}</p>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-black text-slate-500 text-center">
                       <div>{doc.date}</div>
                       {doc.dueDate && <div className="text-[8px] text-slate-300">يستحق: {doc.dueDate}</div>}
                    </td>
                    <td className="px-6 py-4 text-left">
                       <p className="font-black text-slate-900 font-mono text-sm">{doc.total.toLocaleString()} DH</p>
                       {(doc.paidAmount || 0) > 0 && <p className="text-[8px] font-bold text-green-600">دفع: {doc.paidAmount?.toLocaleString()} DH</p>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-1">
                        {type === DocType.DEVIS && (
                          <button 
                            onClick={() => handleConvertToInvoice(doc)} 
                            title="تحويل لفاتورة" 
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                        <button onClick={() => handleWhatsApp(doc)} title="واتساب" className="p-2 text-green-500 hover:bg-green-100 rounded-lg transition-all">
                          <MessageCircle size={18} />
                        </button>
                        <button onClick={() => onPrint(doc)} title="طباعة/تصدير" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => onEdit(doc)} title="تعديل" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} title="حذف" className="p-2 text-slate-200 hover:text-red-600 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center text-slate-300">
                      <FileDown size={48} className="mb-2 opacity-20" />
                      <p className="text-sm font-bold">لا توجد سجلات حالياً</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
