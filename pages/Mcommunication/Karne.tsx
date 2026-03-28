
import React from 'react';
import { AppState } from '../../types';
import { 
  BookOpen, User, Star, Shield, 
  TrendingUp, Activity, Lock 
} from 'lucide-react';

interface KarneProps {
  state: AppState;
}

const Karne: React.FC<KarneProps> = ({ state }) => {
  // Mock Trust Data - Internal View Only
  const citizens = [
    { id: 1, name: 'Ahmed Amrani', type: 'Active Citizen', trustScore: 92, status: 'Trusted', behavior: 'Constructive' },
    { id: 2, name: 'Samir Digital', type: 'Silent Observer', trustScore: 78, status: 'Neutral', behavior: 'Passive' },
    { id: 3, name: 'Unknown User 404', type: 'Active Citizen', trustScore: 35, status: 'Watchlist', behavior: 'Agitator' },
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500 text-right font-arabic" dir="rtl">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
           <BookOpen className="text-amber-600" size={32} /> Karné (Social Trust Ledger)
        </h2>
        <p className="text-slate-500 font-medium">دفتر الثقة الصامت. لا يعرض أرقاماً للمستخدم، بل يحدد "الأحقية" في الفرص.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-right">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-5">المواطن</th>
                     <th className="px-8 py-5 text-center">التصنيف السلوكي</th>
                     <th className="px-8 py-5 text-center">مؤشر الثقة (Silent)</th>
                     <th className="px-8 py-5 text-center">الإجراء التلقائي</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {citizens.map(c => (
                     <tr key={c.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.trustScore > 80 ? 'bg-green-100 text-green-600' : c.trustScore < 50 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                 <User size={20} />
                              </div>
                              <div>
                                 <p className="font-black text-slate-800 text-sm">{c.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold">{c.type}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                              c.behavior === 'Constructive' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                              c.behavior === 'Agitator' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                           }`}>
                              {c.behavior}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <div className="w-32 mx-auto bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`h-full ${c.trustScore > 80 ? 'bg-green-500' : c.trustScore < 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{width: `${c.trustScore}%`}}></div>
                           </div>
                           <p className="text-[9px] font-mono mt-1 text-slate-400">{c.trustScore}/100</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           {c.trustScore > 80 ? (
                              <div className="flex items-center justify-center gap-1 text-green-600 text-[10px] font-black">
                                 <Star size={12} className="fill-current" /> أولوية الفرص
                              </div>
                           ) : c.trustScore < 50 ? (
                              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-black">
                                 <Lock size={12} /> تقليل الظهور
                              </div>
                           ) : (
                              <span className="text-[10px] text-slate-400">عادي</span>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Karne;
