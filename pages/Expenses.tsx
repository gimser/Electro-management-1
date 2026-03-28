
import React, { useState } from 'react';
import { AppState, Expense } from '../types';
import { useAuth } from '../context/AuthContext';
import { createRecord } from '../db';
import { Plus, Trash2, Wallet, Calendar, Tag, CreditCard, Search } from 'lucide-react';

interface ExpensesPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Other'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      ...formData,
      id: crypto.randomUUID()
    };
    updateState(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
      activityLogs: [createRecord({
        userId: authUser?.id || 'system',
        username: authUser?.fullName || 'System',
        action: 'EXPENSE_ADDED',
        module: 'FINANCE',
        timestamp: new Date().toISOString(),
        details: `تسجيل مصروف جديد: ${newExpense.description} بمبلغ ${newExpense.amount} DH`,
        severity: 'Info'
      }), ...(prev.activityLogs || [])]
    }));
    setShowForm(false);
    setFormData({ description: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Other' });
  };

  const handleDelete = (id: string) => {
    if (confirm('هل تريد حذف هذا المصروف؟')) {
      updateState(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id)
      }));
    }
  };

  const categories = {
    'Materials': { label: 'مواد وقطع غيار', color: 'bg-blue-100 text-blue-700' },
    'Rent': { label: 'كراء ومصاريف ثابتة', color: 'bg-purple-100 text-purple-700' },
    'Salary': { label: 'أجور وتعويضات', color: 'bg-green-100 text-green-700' },
    'Transport': { label: 'نقل وتنقل', color: 'bg-orange-100 text-orange-700' },
    'Other': { label: 'أخرى', color: 'bg-slate-100 text-slate-700' }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">تتبع المصاريف</h2>
          <p className="text-slate-500 font-medium">إدارة فواتير المشتريات والمصاريف التشغيلية</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-red-100 transition-all"
        >
          <Plus size={18} /> إضافة مصروف
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase">المصروف / البيان</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase text-center">التصنيف</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase text-center">التاريخ</th>
              <th className="px-6 py-4 font-black text-slate-600 text-xs uppercase text-left">المبلغ (DH)</th>
              <th className="px-6 py-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {state.expenses.length > 0 ? state.expenses.slice().reverse().map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{expense.description}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${categories[expense.category].color}`}>
                    {categories[expense.category].label}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{expense.date}</td>
                <td className="px-6 py-4 text-left font-black text-red-600 font-mono">
                  {expense.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">لا توجد مصاريف مسجلة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">تسجيل مصروف جديد</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">وصف المصروف</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">المبلغ (DH)</label>
                  <input 
                    type="number"
                    required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black font-mono"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">التاريخ</label>
                  <input 
                    type="date"
                    required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">التصنيف</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                >
                  {Object.entries(categories).map(([val, {label}]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg mt-4 uppercase tracking-widest">
                حفظ المصروف
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
