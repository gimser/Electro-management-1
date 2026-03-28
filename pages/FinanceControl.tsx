
import React from 'react';
import { AppState, DocType } from '../types';
import { BarChart3, Receipt, FileCheck, Calendar, Download, ShieldCheck, AlertCircle, PieChart } from 'lucide-react';

interface FinanceControlProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const FinanceControl: React.FC<FinanceControlProps> = ({ state }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const quarter = Math.floor(currentMonth / 3) + 1;
  
  // فواتير المبيعات (TVA Collectée)
  const salesDocs = state.documents.filter(d => {
    const dDate = new Date(d.date);
    const dQuarter = Math.floor(dDate.getMonth() / 3) + 1;
    return d.type === DocType.FACTURE && dDate.getFullYear() === currentYear && dQuarter === quarter && d.status === 'Paid';
  });

  const totalSalesHT = salesDocs.reduce((acc, d) => acc + d.subtotal, 0);
  const totalTvaCollected = salesDocs.reduce((acc, d) => acc + (d.tvaAmount || 0), 0);

  // حساب تقديري للضريبة المسترجعة (TVA Récupérable) من المشتريات (20% افتراضياً للتبسيط)
  // في نظام محاسبي حقيقي، يجب أن تكون الـ Expenses تحتوي على حقل TVA منفصل
  const expenses = state.expenses.filter(e => {
     const eDate = new Date(e.date);
     const eQuarter = Math.floor(eDate.getMonth() / 3) + 1;
     return eDate.getFullYear() === currentYear && eQuarter === quarter;
  });
  const totalExpensesTTC = expenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedTvaRecoverable = totalExpensesTTC / 6; // تقريبياً (Amount / 1.2 * 0.2)

  const netTvaToPay = totalTvaCollected - estimatedTvaRecoverable;

  return (
    <div className="p-8 animate-in fade-in duration-700 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <PieChart className="text-blue-600" size={32} /> الإقرار الضريبي (Déclaration TVA)
          </h2>
          <p className="text-slate-500 font-medium">حساب الضريبة المستحقة للربع {quarter} من سنة {currentYear}</p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all uppercase text-[10px] tracking-widest">
           <Download size={18} /> تصدير تقرير المحاسب
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
               <ShieldCheck size={14} className="text-green-500" /> TVA Collectée (المحصلة)
            </p>
            <p className="text-3xl font-black text-slate-900 font-mono">{totalTvaCollected.toLocaleString()} <span className="text-sm">DH</span></p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">على مبيعات بقيمة: {totalSalesHT.toLocaleString()} DH HT</p>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
               <Download size={14} className="text-blue-500" /> TVA Récupérable (تقديري)
            </p>
            <p className="text-3xl font-black text-blue-900 font-mono">{estimatedTvaRecoverable.toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-sm">DH</span></p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">على مصاريف: {totalExpensesTTC.toLocaleString()} DH TTC</p>
         </div>

         <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${netTvaToPay > 0 ? 'bg-red-50 border-red-100 text-red-900' : 'bg-green-50 border-green-100 text-green-900'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
               <AlertCircle size={14} /> صافي الضريبة للأداء
            </p>
            <p className="text-4xl font-black font-mono tracking-tighter">{netTvaToPay > 0 ? netTvaToPay.toLocaleString(undefined, {maximumFractionDigits: 0}) : 0} <span className="text-sm">DH</span></p>
            {netTvaToPay < 0 && <p className="text-xs font-black mt-2">لديك رصيد دائن (Crédit de TVA): {Math.abs(netTvaToPay).toLocaleString(undefined, {maximumFractionDigits: 0})} DH</p>}
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
               <FileCheck className="text-blue-600" /> تفاصيل الفواتير المصرح بها
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">التاريخ</th>
                     <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">المرجع</th>
                     <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Base HT</th>
                     <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Taux</th>
                     <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-widest text-left">Montant TVA</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {salesDocs.slice().reverse().map(doc => (
                     <tr key={doc.id} className="hover:bg-blue-50/20 transition-all group">
                        <td className="px-10 py-6 text-xs font-bold text-slate-500">{doc.date}</td>
                        <td className="px-10 py-6 font-black text-slate-800 text-sm font-mono">{doc.number}</td>
                        <td className="px-10 py-6 text-center font-mono font-bold text-slate-600">{doc.subtotal.toLocaleString()}</td>
                        <td className="px-10 py-6 text-center font-black text-xs bg-slate-100/50 rounded-lg">20%</td>
                        <td className="px-10 py-6 text-left font-black text-blue-600 font-mono">{(doc.tvaAmount || 0).toLocaleString()} DH</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default FinanceControl;
