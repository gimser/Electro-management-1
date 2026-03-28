
import React, { useState } from 'react';
import { AppState } from '../types';
import { 
  LayoutDashboard, Activity, Eye, ShieldAlert, 
  MessageSquare, Radio, Users, BarChart3, 
  Globe, Server, Filter, BookOpen, AlertTriangle
} from 'lucide-react';

// Sub-modules import
import RasHanout from './Mcommunication/RasHanout';
import Karne from './Mcommunication/Karne';
import L3arMode from './Mcommunication/L3arMode';
import ContentModeration from './Mcommunication/ContentModeration';

interface McommunicationPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

type Tab = 'DASHBOARD' | 'MODERATION' | 'ALGORITHM' | 'TRUST_LEDGER' | 'EMERGENCY' | 'BROADCAST';

const McommunicationPage: React.FC<McommunicationPageProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');

  // Mock Platform Data (Sovereign View)
  const platformStats = {
    totalUsers: 145020,
    activeNow: 3204,
    flaggedContent: 45,
    systemStatus: 'Optimal',
    sentiment: 'Neutral-Positive'
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white border border-slate-700 shadow-xl">
           <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Users size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Citizens (Users)</span>
           </div>
           <p className="text-3xl font-black font-mono">{platformStats.totalUsers.toLocaleString()}</p>
           <div className="mt-2 text-[10px] text-green-400 font-bold flex items-center gap-1">
              <Activity size={10} /> +12% Growth
           </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] text-white border border-slate-700 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-green-500 animate-pulse"></div>
           <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Globe size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Traffic</span>
           </div>
           <p className="text-3xl font-black font-mono text-green-400">{platformStats.activeNow}</p>
           <p className="text-[10px] text-slate-500 mt-1">Real-time sessions</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] text-white border border-slate-700 shadow-xl">
           <div className="flex items-center gap-3 mb-2 text-slate-400">
              <ShieldAlert size={18} className="text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Governance Alerts</span>
           </div>
           <p className="text-3xl font-black font-mono text-red-500">{platformStats.flaggedContent}</p>
           <p className="text-[10px] text-slate-500 mt-1">Require moderation action</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] text-white border border-slate-700 shadow-xl">
           <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Server size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Infrastructure</span>
           </div>
           <p className="text-xl font-black font-mono text-blue-400">{platformStats.systemStatus}</p>
           <p className="text-[10px] text-slate-500 mt-2">Latency: 24ms | Load: 45%</p>
        </div>
      </div>

      {/* Live Graph Simulation */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm h-80 relative overflow-hidden">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
               <Activity className="text-blue-600" /> النشاط الحي (Platform Pulse)
            </h3>
            <div className="flex gap-2">
               <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">Feed Velocity</span>
               <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">Interactions</span>
            </div>
         </div>
         {/* CSS Graph Representation */}
         <div className="absolute bottom-0 left-0 right-0 h-48 flex items-end justify-between px-8 gap-1 opacity-50">
            {Array.from({length: 40}).map((_, i) => (
               <div 
                  key={i} 
                  className="w-full bg-blue-500 rounded-t-sm transition-all duration-1000 ease-in-out"
                  style={{ 
                     height: `${Math.random() * 80 + 10}%`,
                     opacity: Math.random() * 0.5 + 0.5 
                  }}
               ></div>
            ))}
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-right font-arabic flex flex-col" dir="rtl">
      
      {/* Top Navigation Bar (Sovereign Header) */}
      <div className="bg-[#0f172a] text-white p-6 sticky top-0 z-50 border-b border-slate-800 shadow-2xl">
         <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                  <Radio size={24} className="animate-pulse" />
               </div>
               <div>
                  <h1 className="text-2xl font-black tracking-tighter uppercase">Mcommunication <span className="text-blue-500">OS</span></h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sovereign Control Interface v3.0</p>
               </div>
            </div>
            
            <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
               {[
                  { id: 'DASHBOARD', label: 'القيادة', icon: <LayoutDashboard size={14}/> },
                  { id: 'MODERATION', label: 'الرقابة', icon: <Eye size={14}/> },
                  { id: 'ALGORITHM', label: 'Ras L\'Hanout', icon: <Filter size={14}/> },
                  { id: 'TRUST_LEDGER', label: 'Karné', icon: <BookOpen size={14}/> },
                  { id: 'EMERGENCY', label: 'L\'3ar Mode', icon: <AlertTriangle size={14}/> },
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as Tab)}
                     className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase transition-all ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                     }`}
                  >
                     {tab.icon}
                     <span className="hidden lg:inline">{tab.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
         
         {activeTab === 'DASHBOARD' && renderDashboard()}
         
         {activeTab === 'MODERATION' && <ContentModeration />}
         
         {activeTab === 'ALGORITHM' && <RasHanout state={state} />}
         
         {activeTab === 'TRUST_LEDGER' && <Karne state={state} />}
         
         {activeTab === 'EMERGENCY' && <L3arMode state={state} />}

      </div>
    </div>
  );
};

export default McommunicationPage;
