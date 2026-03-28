
import React, { useState } from 'react';
import { AppState } from '../types';
import { 
  Megaphone, Target, Workflow, BarChart3, 
  Terminal, Play, Pause, Trash2, Plus, 
  Search, Filter, Activity, TrendingUp, Zap
} from 'lucide-react';

interface MarketingPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'logs'>('campaigns');

  return (
    <div className="p-8 space-y-10 animate-slide-up text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Megaphone className="text-purple-600" size={32} /> مركز النمو والتسويق الرقمي
          </h2>
          <p className="text-slate-500 font-medium">إإدارة الحملات الإعلانية ومراقبة محرك الاستقطاب</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
          <button onClick={() => setActiveTab('campaigns')} className={`px-8 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>الحملات النشطة</button>
          <button onClick={() => setActiveTab('logs')} className={`px-8 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'logs' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>سجل العمليات</button>
        </div>
      </div>

      {activeTab === 'campaigns' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {state.campaigns.map((camp) => (
             <div key={camp.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                   <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                      <Target size={24} />
                   </div>
                   <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase border ${camp.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-50'}`}>
                      {camp.status}
                   </span>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1">{camp.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{camp.platform}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">الميزانية</p>
                      <p className="text-sm font-black text-slate-900">{camp.budget} DH</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">المستقطب</p>
                      <p className="text-sm font-black text-purple-600">{camp.leadsCount} Leads</p>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <TrendingUp size={14} className="text-green-500" />
                      <span>ROI: {(camp.conversionsCount * 1.5).toFixed(1)}x</span>
                   </div>
                </div>
             </div>
           ))}
           {state.campaigns.length === 0 && (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] opacity-30">
                 <Megaphone size={48} className="mx-auto mb-4" />
                 <p className="font-black text-xl">لا توجد حملات مسجلة حالياً</p>
              </div>
           )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-3">
               <Terminal size={24} className="text-green-400" /> سجل العمليات البرمجية (Central Activity)
            </h3>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/10 pb-4">GIM-CORE LOGIC ENGINE &gt;_</div>
            
            <div className="space-y-4 font-mono text-xs max-h-[400px] overflow-y-auto custom-scrollbar">
               {state.automationLogs?.map((log, i) => (
                 <div key={i} className="flex gap-4 border-b border-white/5 pb-2">
                    <span className="text-slate-500">[{log.timestamp.slice(11, 19)}]</span>
                    <span className="text-blue-400">{log.action}:</span>
                    <span className="text-slate-300">{log.details}</span>
                 </div>
               ))}
               {(!state.automationLogs || state.automationLogs.length === 0) && (
                  <p className="text-slate-600">No active logs in the engine...</p>
               )}
            </div>
          </div>
          <Zap size={200} className="absolute -right-10 -bottom-10 text-white/5 pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default MarketingPage;
