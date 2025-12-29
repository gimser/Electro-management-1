
import React, { useState } from 'react';
import { AppState, Document, DocType } from '../types';
import { Plus, Search, Trash2, Edit2, Printer, Filter, MoreVertical, Eye } from 'lucide-react';

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Sent': return 'bg-blue-100 text-blue-700';
      case 'Draft': return 'bg-slate-100 text-slate-600';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getDocName = () => {
    switch(type) {
      case DocType.DEVIS: return 'عروض الأثمان';
      case DocType.FACTURE: return 'الفواتير';
      case DocType.CONTRAT: return 'العقود';
      case DocType.RAPPORT: return 'التقارير التقنية';
      default: return 'الوثائق';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{getDocName()}</h2>
          <p className="text-slate-500">إدارة الوثائق الصادرة لشركة Electro GIM</p>
        </div>
        <button 
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={18} /> إنشاء جديد
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث برقم الوثيقة أو اسم الزبون..." 
              className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white transition-all flex items-center gap-2 text-slate-600">
            <Filter size={18} /> تصفية
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">الرقم</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">الزبون</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">التاريخ</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">المجموع</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">الحالة</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm text-left">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                const client = state.clients.find(c => c.id === doc.clientId);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{doc.number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{client?.name || 'غير معروف'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 font-mono">{doc.total.toFixed(2)} DH</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onPrint(doc)} title="عرض وطباعة" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => onEdit(doc)} title="تعديل" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} title="حذف" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">لا توجد وثائق.</td>
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
