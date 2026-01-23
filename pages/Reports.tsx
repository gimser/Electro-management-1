
import React from 'react';
import { AppState, DocType } from '../types';
import { FileBarChart, ArrowUpCircle, ArrowDownCircle, Percent, Wallet } from 'lucide-react';

interface ReportsPageProps {
  state: AppState;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ state }) => {
  const isRTL = state.settings.language === 'ar';

  // Calculations
  const totalFacturedHT = state.documents
    .filter(d => d.type === DocType.FACTURE && d.status === 'Paid')
    .reduce((acc, d) => acc + d.subtotal, 0);

  const totalTVA_Collected = totalFacturedHT * 0.2;
  
  const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  
  // Categorized Expenses
  const categories = ['Materials', 'Rent', 'Salary', 'Transport', 'Other'];
  const expenseBreakdown = categories.map(cat => ({
    name: cat,
    amount: state.expenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0)
  }));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isRTL ? 'التقارير المحاسبية' : 'Accounting Reports'}</h2>
        <p className="text-slate-500 font-medium">{isRTL ? 'تحليل الأداء المالي والالتزامات الضريبية' : 'Financial performance & tax analysis'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TVA Report Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-widest text-xs border-b border-slate-50 pb-4">
            <Percent size={20} /> {isRTL ? 'تقرير الضريبة (TVA)' : 'TVA Report'}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">المداخيل الخاضعة للضريبة (HT)</p>
                <p className="text-2xl font-black text-slate-800 font-mono">{totalFacturedHT.toLocaleString()} DH</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">TVA (20%)</p>
                <p className="text-2xl font-black text-blue-600 font-mono">{totalTVA_Collected.toLocaleString()} DH</p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-800 uppercase mb-2 tracking-widest">تنبيه محاسبي</p>
              <p className="text-xs text-blue-700 font-bold leading-relaxed">
                {isRTL 
                  ? "إجمالي مبالغ الضريبة المحصلة الواجب التصريح بها هي مبالغ تقديرية بناءً على الفواتير المدفوعة فقط."
                  : "Total collected tax amounts to be declared are estimates based on paid invoices only."}
              </p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-xs border-b border-slate-50 pb-4">
            <Wallet size={20} /> {isRTL ? 'تحليل المصاريف' : 'Expense Breakdown'}
          </div>
          <div className="space-y-4">
            {expenseBreakdown.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                  <span>{cat.name}</span>
                  <span>{totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-1000" 
                    style={{ width: `${totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Simulation */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-blue-400">{isRTL ? 'نظرة عامة على السيولة' : 'Cash Flow Overview'}</h3>
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-500/10 rounded-2xl text-green-500"><ArrowUpCircle size={32} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">مداخيل (TTC)</p>
                <p className="text-3xl font-black">{(totalFacturedHT * 1.2).toLocaleString()} <span className="text-sm text-slate-500">DH</span></p>
              </div>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-500/10 rounded-2xl text-red-500"><ArrowDownCircle size={32} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">مصاريف</p>
                <p className="text-3xl font-black">{totalExpenses.toLocaleString()} <span className="text-sm text-slate-500">DH</span></p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      </div>
    </div>
  );
};

export default ReportsPage;
