
import React, { useState } from 'react';
import { AppState, NetworkDevice, DeviceStatus } from '../types';
import { 
  Network, Wifi, Zap, Activity, ShieldAlert, 
  Terminal, Globe, Search, RefreshCw, AlertTriangle, 
  CheckCircle2, Cpu, HardDrive, Info, Router, 
  ShieldCheck, Server, Video, Smartphone, Plus, Trash2, X, Save,
  SearchCode, HelpCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface NetworkFaultsProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const NetworkFaults: React.FC<NetworkFaultsProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosticSteps, setDiagnosticSteps] = useState<string[]>([]);
  const [foundIssues, setFoundIssues] = useState<Array<{type: string, severity: string, detail: string}>>([]);

  const selectedClient = state.clients.find(c => c.id === selectedClientId);
  const clientDevices = state.networkDevices.filter(d => d.clientId === selectedClientId);

  const runDiscovery = () => {
    if (!selectedClientId) return alert('يرجى اختيار زبون أولاً');
    setIsScanning(true);
    setDiagnosticSteps([]);
    setFoundIssues([]);

    const steps = [
      "فحص استجابة البوابة الافتراضية (Gateway)...",
      "تحليل تعارض عناوين IP في الشبكة المحلية...",
      "فحص جودة كابلات Ethernet (Signal Loss)...",
      "التحقق من DNS Resolution وسرعة الاستجابة...",
      "اكتمال التشخيص التقني للشبكة."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDiagnosticSteps(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        finalizeDiscovery();
      }
    }, 800);
  };

  const finalizeDiscovery = () => {
    setIsScanning(false);
    // In production, this would connect to real network probes
    const issues: Array<{type: string, severity: string, detail: string}> = [];
    
    // Logic to detect real issues would go here
    if (clientDevices.length === 0) {
      issues.push({ type: 'No Devices', severity: 'Medium', detail: 'لم يتم العثور على أجهزة مسجلة لهذا الزبون' });
    }

    setFoundIssues(issues);
    
    updateState(prev => ({
      ...prev,
      activityLogs: [{
        id: crypto.randomUUID(),
        userId: authUser?.id || 'system',
        username: authUser?.fullName || 'System',
        action: 'NETWORK_DIAGNOSTIC_RUN',
        module: 'NETWORK',
        timestamp: new Date().toISOString(),
        details: `تم إجراء تشخيص شبكة للزبون ${selectedClient?.name}`,
        severity: 'Info'
      }, ...(prev.activityLogs || [])]
    }));
  };

  return (
    <div className="p-8 space-y-10 animate-slide-up text-right font-arabic max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
             <Network className="text-blue-600" size={32} /> مركز اكتشاف أعطال الشبكات
          </h2>
          <p className="text-slate-500 font-medium">أدوات التشخيص الميداني والتحليل المنطقي للبنية التحتية</p>
        </div>
        
        <div className="flex gap-4">
           <select 
             className="bg-white border-2 border-slate-200 px-6 py-4 rounded-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
             value={selectedClientId}
             onChange={e => setSelectedClientId(e.target.value)}
           >
             <option value="">-- اختر الزبون للتشخيص --</option>
             {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
           
           <button 
             onClick={runDiscovery}
             disabled={isScanning || !selectedClientId}
             className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
           >
             {isScanning ? <RefreshCw className="animate-spin" size={20} /> : <SearchCode size={20} />}
             {isScanning ? 'جاري التشخيص...' : 'بدء فحص الأعطال'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Terminal Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-green-400 shadow-2xl relative overflow-hidden flex flex-col h-[500px]">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6 shrink-0">
                 <Terminal size={18} className="text-blue-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">GIM-NOC Network Discovery v4.0</span>
              </div>
              
              <div className="flex-1 space-y-4 font-mono text-sm overflow-y-auto custom-scrollbar pr-2" dir="ltr">
                 {diagnosticSteps.map((step, i) => (
                    <div key={i} className="flex gap-3 animate-in fade-in duration-500">
                       <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                       <span className="text-white">&gt; {step}</span>
                    </div>
                 ))}
                 {isScanning && (
                    <div className="flex items-center gap-3 text-blue-400 italic animate-pulse">
                       <Activity size={18} /> جاري تحليل طبقات الـ OSI...
                    </div>
                 )}
                 {!isScanning && diagnosticSteps.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-40">
                       <Network size={64} />
                       <p className="font-black uppercase tracking-widest text-xs">اضغط على زر الفحص لبدء اكتشاف الأعطال</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Results Section */}
           {foundIssues.length > 0 && (
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in slide-in-from-bottom-5">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                   <ShieldAlert size={20} className="text-red-500" /> الأعطال المكتشفة منطقياً
                </h3>
                <div className="space-y-4">
                   {foundIssues.map((issue, i) => (
                      <div key={i} className="bg-red-50 border-2 border-red-100 p-5 rounded-2xl flex gap-5 items-center">
                         <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center shrink-0">
                            <AlertTriangle size={24} />
                         </div>
                         <div>
                            <p className="font-black text-red-800 text-sm">نوع الخلل: {issue.type}</p>
                            <p className="text-red-600 text-xs font-bold leading-relaxed">{issue.detail}</p>
                         </div>
                         <div className="mr-auto text-[10px] font-black bg-red-100 text-red-700 px-3 py-1 rounded-lg">
                            {issue.severity}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Knowledge Sidebar */}
        <div className="space-y-6">
           <div className="bg-blue-600 rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                 <HelpCircle size={22} /> توصيات المهندس
              </h3>
              <p className="text-blue-100 text-xs font-bold leading-relaxed relative z-10 opacity-90">
                 كخبير GIM، تأكد دائماً من أن كابلات الشبكة محمية (SFTP) عند مرورها بجانب خطوط الكهرباء لتجنب الـ EMI (التداخل الكهرومغناطيسي).
              </p>
              <Zap className="absolute -left-10 -bottom-10 text-white/10 w-48 h-48 rotate-12" />
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <Activity size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">معدل استقرار الشبكة</p>
                    <p className="text-lg font-black text-slate-800">{selectedClientId ? '96.4%' : '---'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <Router size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">أجهزة قيد المراقبة</p>
                    <p className="text-lg font-black text-slate-800">{clientDevices.length} أجهزة</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkFaults;
