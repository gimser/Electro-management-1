
import React from 'react';
import { AppState, DocType } from '../types';
import { 
  TrendingUp, BarChart3, PieChart, Scale, 
  ArrowUpRight, CalendarRange, Target, Wallet
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  state: AppState;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ state }) => {
  const currentYear = new Date().getFullYear();
  
  // 1. Financial Deep Dive
  const paidInvoices = state.documents.filter(d => d.type === DocType.FACTURE && d.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((acc, d) => acc + d.total, 0);
  const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // 2. Operational KPIs
  const totalTickets = state.customerIssues.length;
  const resolvedTickets = state.customerIssues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : '0';

  // 3. Inventory Health
  const totalStockValue = state.inventory.reduce((acc, i) => acc + (i.purchasePrice * i.quantity), 0);
  const potentialSalesValue = state.inventory.reduce((acc, i) => acc + (i.sellingPrice * i.quantity), 0);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-24 text-right font-arabic" dir="rtl">
      
      <div className="flex justify-between items-center mb-4">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
              <BarChart3 className="text-purple-600" size={32} /> التحليل الاستراتيجي (Strategic Intel)
           </h2>
           <p className="text-slate-500 font-bold">نظرة معمقة على الأداء السنوي ومؤشرات النمو</p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">هامش الربح الصافي</p>
            <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-slate-800">{profitMargin}%</p>
                {Number(profitMargin) > 20 && <TrendingUp className="text-green-500 mb-2" size={24} />}
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">قيمة المخزن (شراء)</p>
            <p className="text-3xl font-black text-blue-900 font-mono">{totalStockValue.toLocaleString()} DH</p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">قيمة المخزن (بيع متوقع)</p>
            <p className="text-3xl font-black text-green-600 font-mono">{potentialSalesValue.toLocaleString()} DH</p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">كفاءة الدعم الفني</p>
            <p className="text-4xl font-black text-slate-800">{resolutionRate}%</p>
         </div>
      </div>

      {/* Yearly Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Scale className="text-blue-600" /> الميزان المالي {currentYear}
            </h3>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500">المداخيل (Revenue)</span>
                        <span className="font-black font-mono text-green-600">{totalRevenue.toLocaleString()} DH</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-full"></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500">المصاريف (Expenses)</span>
                        <span className="font-black font-mono text-red-500">{totalExpenses.toLocaleString()} DH</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${Math.min((totalExpenses/totalRevenue)*100, 100)}%` }}></div>
                    </div>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-4">
                    <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                        <span className="text-xs font-black uppercase tracking-widest">صافي الأرباح (Net)</span>
                        <span className="text-2xl font-black font-mono">{netProfit.toLocaleString()} DH</span>
                    </div>
                </div>
            </div>
         </div>

         {/* Growth Targets */}
         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <Target className="text-amber-500" /> أهداف النمو
                </h3>
                <div className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-300">هدف المبيعات الشهري</span>
                            <span className="text-xs font-black text-amber-400">75%</span>
                        </div>
                        <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full w-[75%]"></div>
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-300">اكتساب زبناء جدد</span>
                            <span className="text-xs font-black text-blue-400">40%</span>
                        </div>
                        <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[40%]"></div>
                        </div>
                    </div>
                </div>
            </div>
            <TrendingUp className="absolute -bottom-10 -left-10 text-white/5 w-64 h-64 rotate-12" />
         </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
