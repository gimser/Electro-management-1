
import React, { useState } from 'react';
import { AppState, DocType, Document } from '../types';
import { 
  Wallet, TrendingUp, TrendingDown, Clock, AlertCircle, 
  CheckCircle2, DollarSign, Receipt, CreditCard, 
  ArrowUpRight, ArrowDownLeft, FileText, Search,
  Filter, Calendar, ChevronRight, MessageSquare, Phone
} from 'lucide-react';

interface FinanceControlProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const FinanceControl: React.FC<FinanceControlProps> = ({ state, updateState, onNavigate }) => {
  const [search, setSearch] = useState('');
  
  // Financial Calculations
  const invoices = state.documents.filter(d => d.type === DocType.FACTURE);
  const totalRevenue = invoices.filter(d => d.status === 'Paid' || d.status === 'Partially-Paid')
    .reduce((acc, d) => acc + (d.paidAmount || d.total), 0);
  
  const totalUnpaid = invoices.filter(d => d.status !== 'Paid' && d.status !== 'Cancelled')
    .reduce((acc, d) => acc + (d.total - (d.paidAmount || 0)), 0);
  
  const totalTVA = invoices.filter(d => d.status === 'Paid')
    .reduce((acc, d) => acc + (d.total - d.subtotal), 0);

  const unpaidInvoices = invoices.filter(d => d.status !== 'Paid' && d.status !== 'Cancelled');

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Partially-Paid': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Sent': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const handleRecordPayment = (docId: string) => {
    const amount = prompt("أدخل المبلغ المحصل (DH):");
    if (!amount || isNaN(Number(amount))) return;

    updateState(prev => ({
      ...prev,
      documents: prev.documents.map(d => {
        if (d.id === docId) {
          const newPaid = (d.paidAmount || 0) + Number(amount);
          return {
            ...d,
            paidAmount: newPaid,
            status: newPaid >= d.total ? 'Paid' : 'Partially-Paid'
          };
        }
        return d;
      }),
      automationLogs: [{
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'PAYMENT_RECORDED',
        status: 'success',
        details: `تم تسجيل دفعة بقيمة ${amount} DH للوثيقة رقم ${state.documents.find(dx => dx.id === docId)?.number}`
      }, ...(prev.automationLogs || [])]
    }));
  };

  const handleWhatsAppReminder = (doc: Document) => {
    const client = state.clients.find(c => c.id === doc.clientId);
    if (!client) return;
    const remaining = doc.total - (doc.paidAmount || 0);
    const message = `تذكير بالأداء - Electro GIM Services\n\nالسيد(ة) ${client.name}،\nنحيطكم علماً بأن الفاتورة رقم ${doc.number} بمبلغ ${doc.total.toLocaleString()} DH (المتبقي: ${remaining.toLocaleString()} DH) لا تزال بانتظار التسوية.\n\nشكراً لتعاونكم.`;
    window.open(`https://wa.me/${client.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="p-8 animate-in fade-in duration-700 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Wallet className="text-blue-600" size={32} /> مركز الإدارة المالية والسيولة
          </h2>
          <p className="text-slate-500 font-medium">تتبع المداخيل، تصفية الديون، ومراقبة الالتزامات الضريبية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المداخيل</p>
            <p className="text-3xl font-black text-slate-800 font-mono">{totalRevenue.toLocaleString('fr-FR')} <span className="text-sm">DH</span></p>
         </div>
         <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm relative overflow-hidden group">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">الديون العالقة (Unpaid)</p>
            <p className="text-3xl font-black text-red-600 font-mono">{totalUnpaid.toLocaleString('fr-FR')} <span className="text-sm">DH</span></p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 flex items-center gap-3">
                     <Clock className="text-amber-500" size={20} /> فواتير غير مسواة (Pending Settlement)
                  </h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-right">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">الفاتورة / الزبون</th>
                           <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">المتبقي</th>
                           <th className="px-8 py-4 text-left">إجراءات التحصيل</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {unpaidInvoices.filter(d => d.number.includes(search)).map(doc => {
                           const client = state.clients.find(c => c.id === doc.clientId);
                           const remaining = doc.total - (doc.paidAmount || 0);
                           return (
                              <tr key={doc.id} className="hover:bg-slate-50/80 transition-all">
                                 <td className="px-8 py-5">
                                    <p className="font-black text-slate-800 text-sm">{doc.number}</p>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase">{client?.name || '---'}</p>
                                 </td>
                                 <td className="px-8 py-5 text-center font-black text-red-600 text-sm font-mono">{remaining.toLocaleString('fr-FR')} DH</td>
                                 <td className="px-8 py-5 text-left">
                                    <div className="flex items-center justify-end gap-2">
                                       <a 
                                          href={`tel:${client?.phone}`}
                                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                          title="اتصال مباشر"
                                       >
                                          <Phone size={16} />
                                       </a>
                                       <button 
                                          onClick={() => handleRecordPayment(doc.id)}
                                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                          title="تسجيل دفعة"
                                       >
                                          <DollarSign size={16} />
                                       </button>
                                       <button 
                                          onClick={() => handleWhatsAppReminder(doc)}
                                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                          title="إرسال تذكير واتساب"
                                       >
                                          <MessageSquare size={16} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FinanceControl;
