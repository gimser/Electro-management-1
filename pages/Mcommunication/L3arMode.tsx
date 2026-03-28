
import React, { useState } from 'react';
import { AppState } from '../../types';
import { 
  Siren, MapPin, Activity, ShieldAlert, 
  Radio, Triangle, AlertOctagon 
} from 'lucide-react';

interface L3arModeProps {
  state: AppState;
}

const L3arMode: React.FC<L3arModeProps> = ({ state }) => {
  const [signals] = useState([
    { id: 'SIG-901', type: 'Medical Emergency', location: 'Casablanca, Ain Diab', coords: '33.5898, -7.6038', time: '02 min ago', credibility: 'Verified', status: 'Active' },
    { id: 'SIG-902', type: 'Civil Unrest', location: 'Rabat, Agdal', coords: '34.0041, -6.8497', time: '15 min ago', credibility: 'Unverified', status: 'Pending Analysis' },
  ]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Siren className="text-red-600" size={32} /> L'3ar Mode (Crisis Grid)
           </h2>
           <p className="text-slate-500 font-medium">شبكة إدارة نداءات الاستغاثة الوطنية. الأولوية القصوى.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-pulse">
                <Radio size={18} />
                <span className="text-xs font-black uppercase">Live Signal Feed</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Map Placeholder */}
         <div className="bg-slate-900 rounded-[2.5rem] p-1 border-4 border-slate-800 shadow-2xl relative h-96 overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[#0f172a] opacity-50">
                 {/* Grid Lines */}
                 <div className="w-full h-full" style={{backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
             </div>
             <div className="relative z-10 text-center">
                 <MapPin size={64} className="text-red-500 mx-auto mb-4 animate-bounce" />
                 <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Geospatial Tracking Active</p>
             </div>
             {/* Mock Ping */}
             <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
         </div>

         {/* Signal List */}
         <div className="space-y-4 overflow-y-auto max-h-96 custom-scrollbar pr-2">
             {signals.map(sig => (
                <div key={sig.id} className={`p-6 rounded-[2rem] border-l-8 shadow-sm transition-all bg-white ${
                    sig.credibility === 'Verified' ? 'border-red-600' : 'border-amber-400'
                }`}>
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest">{sig.id}</span>
                         <h3 className="font-black text-lg text-slate-800 mt-2">{sig.type}</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                          sig.status === 'Active' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                          {sig.status}
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 mb-6">
                       <div className="flex items-center gap-2"><MapPin size={14}/> {sig.location}</div>
                       <div className="flex items-center gap-2"><Activity size={14}/> {sig.time}</div>
                       <div className="col-span-2 font-mono text-[10px] bg-slate-50 p-2 rounded">{sig.coords}</div>
                   </div>

                   <div className="flex gap-3">
                      <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-red-600 transition-all shadow-lg">
                         Dispatch Authorities
                      </button>
                      <button className="px-4 bg-white border-2 border-slate-200 text-slate-400 rounded-xl hover:border-slate-400 hover:text-slate-600 transition-all">
                         Dismiss
                      </button>
                   </div>
                </div>
             ))}
         </div>
      </div>
    </div>
  );
};

export default L3arMode;
