
import React, { useState } from 'react';
import { AppState } from '../../types';
import { 
  Sliders, Activity, Zap, TrendingUp, 
  Shield, Volume2, Globe, Layers, AlertCircle
} from 'lucide-react';

interface RasHanoutProps {
  state: AppState;
}

const RasHanout: React.FC<RasHanoutProps> = ({ state }) => {
  // Mock Algorithm Parameters
  const [params, setParams] = useState([
    { id: 'p1', label: 'Virality Threshold', value: 75, desc: 'Minimum engagement velocity to trigger global push.' },
    { id: 'p2', label: 'Fake News Sensitivity', value: 90, desc: 'AI strictness on unverified sources.' },
    { id: 'p3', label: 'Local Community Boost', value: 60, desc: 'Priority for hyper-local content within 5km.' },
    { id: 'p4', label: 'Sentiment Damping', value: 40, desc: 'Suppress overly negative content propagation.' },
    { id: 'p5', label: 'Commercial Dilution', value: 20, desc: 'Frequency of ads vs organic content.' },
  ]);

  const handleSliderChange = (id: string, newVal: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, value: newVal } : p));
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
           <Sliders className="text-blue-600" size={32} /> Ras L'Hanout (Algorithm Tuner)
        </h2>
        <p className="text-slate-500 font-medium">غرفة التحكم في خوارزميات الانتشار والترتيب. التعديلات هنا تؤثر فورياً على تجربة 1.2 مليون مستخدم.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Console */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Activity size={200} />
           </div>
           
           <div className="space-y-8 relative z-10">
              {params.map(param => (
                 <div key={param.id} className="space-y-3">
                    <div className="flex justify-between items-end">
                       <div>
                          <label className="text-sm font-black text-slate-800 flex items-center gap-2">
                             <Zap size={14} className={param.value > 80 ? 'text-red-500' : 'text-blue-500'} />
                             {param.label}
                          </label>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">{param.desc}</p>
                       </div>
                       <span className="text-xl font-black font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{param.value}%</span>
                    </div>
                    <div className="relative h-4 bg-slate-100 rounded-full">
                       <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={param.value} 
                          onChange={(e) => handleSliderChange(param.id, parseInt(e.target.value))}
                          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                       />
                       <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                             param.value > 80 ? 'bg-red-500' : param.value > 50 ? 'bg-blue-500' : 'bg-slate-400'
                          }`} 
                          style={{ width: `${param.value}%` }}
                       ></div>
                       <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-1 pointer-events-none z-10">
                          {Array.from({length: 10}).map((_, i) => (
                             <div key={i} className="w-0.5 h-1 bg-white/50"></div>
                          ))}
                       </div>
                    </div>
                 </div>
              ))}
           </div>

           <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
              <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-600 transition-all text-xs uppercase tracking-widest">
                 Apply Configuration Updates
              </button>
           </div>
        </div>

        {/* Live Impact Preview */}
        <div className="space-y-6">
           <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                 <Globe size={20} className="text-green-400" /> Projected Impact
              </h3>
              
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                       <TrendingUp size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400">Reach Multiplier</p>
                       <p className="text-2xl font-black">1.4x</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                       <Shield size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400">Content Safety</p>
                       <p className="text-2xl font-black text-green-400">98.2%</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                       <Layers size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400">Feed Diversity</p>
                       <p className="text-2xl font-black text-amber-400">Med-High</p>
                    </div>
                 </div>
              </div>
              <Volume2 className="absolute -right-5 -bottom-5 text-white/5 w-40 h-40 rotate-12" />
           </div>

           <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem]">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                 <AlertCircle size={18} />
                 <span className="font-black text-xs uppercase">AI Advisory</span>
              </div>
              <p className="text-xs font-bold text-amber-700 leading-relaxed">
                 زيادة حساسية "Fake News" فوق 85% قد تؤدي إلى حجب منشورات شرعية تحتوي على كلمات مفتاحية ساخرة. يرجى المراقبة.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default RasHanout;
