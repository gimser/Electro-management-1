
import React, { useState } from 'react';
import { AppState } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
    ShieldCheck, Video, Lock, Unlock, AlertTriangle, 
    Eye, Activity, Network, Globe, Radio 
} from 'lucide-react';

interface SecurityCenterProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SecurityCenter: React.FC<SecurityCenterProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [isIsolationActive, setIsIsolationActive] = useState(false);
  const cameras = state.iotDevices.filter(d => d.type === 'Camera');
  const locks = state.iotDevices.filter(d => d.type === 'Lock');

  const toggleIsolation = () => {
      setIsIsolationActive(!isIsolationActive);
      // Simulate applying isolation rules
      updateState(prev => ({
          ...prev,
          iotDevices: prev.iotDevices.map(d => ({
              ...d,
              networkSegment: isIsolationActive ? 'Main' : 'IoT_Isolated'
          })),
          activityLogs: [{
            id: crypto.randomUUID(),
            userId: authUser?.id || 'system',
            username: authUser?.fullName || 'System',
            action: isIsolationActive ? 'NETWORK_UNISOLATED' : 'NETWORK_ISOLATED',
            module: 'SMART_HOME',
            timestamp: new Date().toISOString(),
            details: isIsolationActive ? 'IoT Network Isolation Disabled' : 'IoT Network Isolation Enabled (Zero Trust Policy)',
            severity: 'Warning'
          }, ...(prev.activityLogs || [])]
      }));
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-[3rem] p-8 text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-black uppercase tracking-tighter">درع الحماية المنزلي</h2>
               <p className="text-blue-200 font-bold text-xs">الحالة: {isIsolationActive ? 'IoT Isolated (Secure)' : 'Standard Mode'}</p>
            </div>
         </div>
         
         <div className="relative z-10 flex gap-4 items-center">
            <div className="text-left hidden md:block">
                <p className="text-[10px] font-black uppercase text-slate-400">Network Policy</p>
                <p className="text-xs font-bold">{isIsolationActive ? 'Strict Segmentation' : 'Default Bridging'}</p>
            </div>
            <button 
                onClick={toggleIsolation}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase shadow-xl transition-all flex items-center gap-2 ${
                    isIsolationActive 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-white text-slate-900 hover:bg-slate-200'
                }`}
            >
                {isIsolationActive ? <CheckCircle2 size={16} /> : <Network size={16} />}
                {isIsolationActive ? 'عزل الشبكة مفعل' : 'تفعيل العزل (Zero Trust)'}
            </button>
         </div>
         <Activity className="absolute -left-10 top-1/2 -translate-y-1/2 text-white/5 w-64 h-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Network Traffic Visualizer (Mock) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Radio size={20} className="text-blue-600" /> تحليل حركة البيانات (IoT Traffic)
                </h3>
            </div>
            <div className="bg-black rounded-[2.5rem] p-6 h-64 relative overflow-hidden border-4 border-slate-800 shadow-lg">
                <div className="absolute inset-0 flex items-end justify-between px-10 pb-10 opacity-50">
                    {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className="w-2 bg-green-500 rounded-t-sm animate-pulse" style={{height: `${Math.random() * 80 + 10}%`, animationDelay: `${i * 0.1}s`}}></div>
                    ))}
                </div>
                {isIsolationActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-green-900/80 text-green-400 border border-green-500 px-6 py-3 rounded-2xl flex items-center gap-3">
                            <Lock size={20} />
                            <span className="font-bold text-sm">Traffic Segmented & Encrypted</span>
                        </div>
                    </div>
                )}
                <div className="absolute top-4 left-4 text-green-500 font-mono text-xs">
                    Inbound: 124 Kbps | Outbound: 40 Kbps
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mt-8">
               <Video size={20} className="text-blue-600" /> البث الحي (Cameras)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {cameras.map(cam => (
                  <div key={cam.id} className="aspect-video bg-slate-900 rounded-3xl relative overflow-hidden group shadow-lg border-2 border-slate-800">
                     <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-white bg-black/50 px-2 py-1 rounded uppercase">REC</span>
                     </div>
                     <div className="absolute bottom-4 right-4 z-20">
                        <p className="text-white font-black text-sm shadow-black drop-shadow-md">{cam.name}</p>
                     </div>
                     {/* Simulated Feed */}
                     <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-600 font-mono text-xs">
                            {isIsolationActive ? '🔒 Secure Stream via VLAN 20' : `Connecting to ${cam.ipAddress}...`}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Access Control & Alerts */}
         <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
               <Lock size={20} className="text-blue-600" /> التحكم بالدخول
            </h3>
            <div className="space-y-4">
               {locks.map(lock => (
                  <div key={lock.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex justify-between items-center">
                     <div>
                        <h4 className="font-black text-slate-800">{lock.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{lock.status} | Batt: 85%</p>
                     </div>
                     <button className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${lock.state.locked ? 'bg-red-50 text-red-600 border-2 border-red-100' : 'bg-green-50 text-green-600 border-2 border-green-100'}`}>
                        {lock.state.locked ? <Lock size={24} /> : <Unlock size={24} />}
                     </button>
                  </div>
               ))}
            </div>
            
            {/* Anomaly Detection Card */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm mt-4">
               <div className="flex items-center gap-2 text-slate-800 mb-4 border-b border-slate-50 pb-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <span className="font-black text-sm">تحليل المخاطر (AI)</span>
               </div>
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-500">Unknown IPs</span>
                       <span className="font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">0 Detected</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-500">Failed Logins</span>
                       <span className="font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">2 Attempts</span>
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// Import helper
import { CheckCircle2 } from 'lucide-react';

export default SecurityCenter;
