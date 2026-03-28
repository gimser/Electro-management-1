
import React from 'react';
import { AppState } from '../../types';
import { 
  Wifi, Zap, Home, Thermometer, Droplets, 
  Activity, Cpu, ShieldCheck, AlertCircle,
  Router, Signal, Play
} from 'lucide-react';

interface SmartDashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SmartDashboard: React.FC<SmartDashboardProps> = ({ state, updateState }) => {
  const activeDevices = (state.iotDevices || []).filter(d => d.status === 'Online');
  const totalPower = (state.iotDevices || []).reduce((acc, d) => acc + (d.state.on ? d.powerConsumption : 0), 0);
  
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 flex items-center gap-3">
               <Home className="text-blue-600" size={32} /> Smart Home OS
            </h2>
            <p className="text-slate-500 font-bold text-sm">نظام تشغيل المنزل الذكي المركزي (GIM-Core)</p>
         </div>
         <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black uppercase tracking-widest">Gateway Connected</span>
         </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Connectivity */}
         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <Wifi size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Latency</span>
               </div>
               <p className="text-4xl font-black font-mono tracking-tight">12 <span className="text-lg text-slate-500">ms</span></p>
               <div className="mt-4 flex items-center gap-2">
                  <Signal size={14} className="text-green-400" />
                  <span className="text-xs font-bold text-slate-400">Stable Connection</span>
               </div>
            </div>
            <Router size={100} className="absolute -right-5 -bottom-5 text-white/5" />
         </div>

         {/* Active Devices */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
               <Cpu size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Active Nodes</span>
            </div>
            <p className="text-4xl font-black text-slate-800 font-mono">{activeDevices.length} <span className="text-lg text-slate-300">/ {state.iotDevices.length}</span></p>
            <p className="mt-4 text-xs font-bold text-slate-400">Total IoT Devices</p>
         </div>

         {/* Energy Consumption */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-amber-400 transition-all">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
               <Zap size={20} className="fill-current" />
               <span className="text-[10px] font-black uppercase tracking-widest">Real-time Load</span>
            </div>
            <p className="text-4xl font-black text-slate-800 font-mono">{totalPower} <span className="text-lg text-slate-300">W</span></p>
            <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
               <div className="bg-amber-500 h-full w-[40%]"></div>
            </div>
         </div>

         {/* Security Status */}
         <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-white/80 mb-4">
                  <ShieldCheck size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Security</span>
               </div>
               <p className="text-3xl font-black">ARMED</p>
               <p className="text-xs font-bold text-white/60 mt-2">All sensors active</p>
            </div>
            <ShieldCheck size={100} className="absolute -right-5 -bottom-5 text-white/10 rotate-12" />
         </div>
      </div>

      {/* Quick Actions & Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
               <Play size={20} className="text-blue-600" /> Active Scenarios (Automation)
            </h3>
            <div className="space-y-4">
               {state.automationScenarios.map(sc => (
                  <div key={sc.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                     <div>
                        <h4 className="font-black text-slate-800 text-sm">{sc.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{sc.action}</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-slate-400">{sc.trigger}</span>
                        <button className={`w-10 h-6 rounded-full p-1 transition-all ${sc.active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                           <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all ${sc.active ? 'translate-x-0' : '-translate-x-4'}`}></div>
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
               <h3 className="text-lg font-black mb-4">System Health</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                     <span>CPU Load (Hub)</span>
                     <span className="text-green-400">12%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full">
                     <div className="bg-green-400 h-full w-[12%]"></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-4">
                     <span>Memory Usage</span>
                     <span className="text-blue-400">45%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full">
                     <div className="bg-blue-400 h-full w-[45%]"></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-4">
                     <span>Disk Space</span>
                     <span className="text-amber-400">60%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full">
                     <div className="bg-amber-400 h-full w-[60%]"></div>
                  </div>
               </div>
            </div>
            <Activity className="absolute -right-5 -bottom-5 text-white/5 w-40 h-40" />
         </div>
      </div>
    </div>
  );
};

export default SmartDashboard;
