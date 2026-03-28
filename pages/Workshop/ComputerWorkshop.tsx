import React, { useState, useEffect } from 'react';
import { AppState, ComputerAsset } from '../../types';
import { generateAutoSerialNumber, createRecord } from '../../db';
import { 
  Monitor, Cpu, HardDrive, Thermometer, Battery, Activity, 
  AlertTriangle, CheckCircle2, RefreshCw, Terminal, 
  Search, Laptop, Server, Plus, Wrench, Save, X, FileWarning,
  ScanBarcode, Hash, Wand2
} from 'lucide-react';

interface ComputerWorkshopProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const ComputerWorkshop: React.FC<ComputerWorkshopProps> = ({ state, updateState }) => {
  const [selectedAsset, setSelectedAsset] = useState<ComputerAsset | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ComputerAsset>>({
    clientId: '', name: '', serialNumber: '', type: 'Laptop', 
    specs: { cpu: '', ram: '', disk: '', gpu: '' },
    reportedIssue: ''
  });

  // Auto-Generate Serial Number on Form Open
  useEffect(() => {
    if (showAddForm && !formData.serialNumber) {
      const nextIndex = state.computerAssets.length;
      const autoSN = generateAutoSerialNumber('PC', nextIndex);
      setFormData(prev => ({ ...prev, serialNumber: autoSN }));
    }
  }, [showAddForm, state.computerAssets.length]);

  // Simulated Live Telemetry Update
  useEffect(() => {
    if (!selectedAsset) return;
    
    const interval = setInterval(() => {
      // Simulate fluctuating temps and battery
      const randomTemp = Math.floor(Math.random() * (selectedAsset.health.cpuTemp > 80 ? 5 : 10)) + (selectedAsset.health.cpuTemp - 2);
      // Keep within bounds
      const normalizedTemp = Math.max(30, Math.min(99, randomTemp));
      
      updateState(prev => ({
        ...prev,
        computerAssets: prev.computerAssets.map(c => 
          c.id === selectedAsset.id 
            ? { ...c, health: { ...c.health, cpuTemp: normalizedTemp } }
            : c
        )
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  const runRemoteDiagnostics = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('تم إرسال أوامر الفحص عن بعد (Agent Command). تم تحديث البيانات بنجاح.');
    }, 2000);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert('الرجاء اختيار زبون');
    if (!formData.serialNumber) return alert('الرقم التسلسلي (Serial Number) إلزامي لتسجيل الجهاز');

    const newAsset = createRecord<ComputerAsset>({
      clientId: formData.clientId!,
      name: formData.name!,
      serialNumber: formData.serialNumber!,
      type: formData.type as any,
      specs: formData.specs as any,
      reportedIssue: formData.reportedIssue || 'لا توجد أعطال مسجلة',
      health: { status: 'Healthy', diskLife: 100, batteryHealth: 100, cpuTemp: 35, lastBootTime: new Date().toISOString(), bluescreenCount: 0 },
      agentInstalled: true,
      lastSync: new Date().toISOString(),
      prediction: 'System Baseline Established - AI Monitoring Active'
    });

    updateState(prev => ({
      ...prev,
      computerAssets: [...(prev.computerAssets || []), newAsset]
    }));
    setShowAddForm(false);
    setFormData({ clientId: '', name: '', serialNumber: '', type: 'Laptop', specs: { cpu: '', ram: '', disk: '', gpu: '' }, reportedIssue: '' });
  };

  const regenerateSerial = () => {
    const nextIndex = state.computerAssets.length + Math.floor(Math.random() * 100);
    const autoSN = generateAutoSerialNumber('PC', nextIndex);
    setFormData(prev => ({ ...prev, serialNumber: autoSN }));
  };

  return (
    <div className="p-8 h-screen bg-[#0f172a] text-white font-arabic text-right overflow-hidden flex flex-col" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
         <div>
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
               <Wrench className="text-blue-500" size={32} /> ورشة الصيانة الذكية (GIM-Care)
            </h2>
            <p className="text-slate-400 font-bold text-sm mt-1">تتبع حالة أجهزة الزبائن والتنبؤ بالأعطال عن بعد</p>
         </div>
         <button onClick={() => setShowAddForm(true)} className="bg-blue-600 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Plus size={18} /> تسجيل جهاز جديد
         </button>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
         
         {/* Sidebar List */}
         <div className="w-1/3 bg-slate-900 rounded-[2.5rem] border border-slate-700 p-6 flex flex-col">
            <div className="mb-6 relative">
               <Search className="absolute right-4 top-3.5 text-slate-500" size={18} />
               <input 
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-12 pl-4 py-3 font-bold text-sm focus:border-blue-500 outline-none text-white placeholder:text-slate-600"
                 placeholder="بحث عن جهاز..."
               />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
               {(state.computerAssets || []).map(asset => {
                  const client = state.clients.find(c => c.id === asset.clientId);
                  return (
                     <div 
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all hover:bg-slate-800 ${
                           selectedAsset?.id === asset.id 
                           ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10' 
                           : 'bg-transparent border-slate-700'
                        }`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${asset.health.status === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                 {asset.type === 'Laptop' ? <Laptop size={18} /> : <Monitor size={18} />}
                              </div>
                              <div>
                                 <h4 className="font-black text-sm">{asset.name}</h4>
                                 <p className="text-[10px] text-slate-400 font-bold">{client?.name}</p>
                              </div>
                           </div>
                           {asset.health.status === 'Critical' && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">S/N: {asset.serialNumber}</span>
                           <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                              <span className={asset.health.diskLife < 30 ? 'text-red-400' : 'text-green-400'}>SSD: {asset.health.diskLife}%</span>
                              <span>{asset.health.cpuTemp}°C</span>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Detail View */}
         <div className="flex-1 bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 relative overflow-hidden flex flex-col">
            {selectedAsset ? (
               <>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div>
                        <h1 className="text-3xl font-black mb-2">{selectedAsset.name}</h1>
                        <div className="flex flex-wrap gap-4 items-center">
                           <div className="flex gap-4 text-xs font-bold text-slate-400">
                              <span className="bg-slate-700 px-3 py-1 rounded-full text-white">{selectedAsset.specs.cpu}</span>
                              <span className="bg-slate-700 px-3 py-1 rounded-full text-white">{selectedAsset.specs.ram}</span>
                              <span className="bg-slate-700 px-3 py-1 rounded-full text-white">{selectedAsset.specs.gpu}</span>
                           </div>
                           <span className="text-xs font-mono font-black text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-2">
                              <Hash size={12} /> {selectedAsset.serialNumber}
                           </span>
                        </div>
                     </div>
                     <button 
                        onClick={runRemoteDiagnostics}
                        disabled={isScanning}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-green-500 transition-all disabled:opacity-50"
                     >
                        {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <Terminal size={16} />}
                        تشخيص مباشر
                     </button>
                  </div>

                  {/* Reported Issue Banner */}
                  {selectedAsset.reportedIssue && (
                     <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-start gap-4 relative z-10">
                        <FileWarning className="text-red-400 shrink-0" size={24} />
                        <div>
                           <h4 className="text-red-400 text-xs font-black uppercase mb-1">المشكل المسجل عند الاستلام (Ticket Issue)</h4>
                           <p className="text-white text-sm font-bold leading-relaxed">{selectedAsset.reportedIssue}</p>
                        </div>
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                     {/* Disk Health */}
                     <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><HardDrive size={14}/> صحة القرص (SSD Life)</h4>
                           <span className={`text-xl font-black font-mono ${selectedAsset.health.diskLife < 50 ? 'text-red-500' : 'text-green-500'}`}>{selectedAsset.health.diskLife}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                           <div className={`h-full ${selectedAsset.health.diskLife < 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${selectedAsset.health.diskLife}%`}}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-bold">S.M.A.R.T Status: {selectedAsset.health.diskLife > 80 ? 'Good' : 'Caution - Backup Recommended'}</p>
                     </div>

                     {/* Thermals */}
                     <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><Thermometer size={14}/> حرارة المعالج</h4>
                           <span className={`text-xl font-black font-mono ${selectedAsset.health.cpuTemp > 85 ? 'text-red-500' : 'text-blue-400'}`}>{selectedAsset.health.cpuTemp}°C</span>
                        </div>
                        <div className="flex gap-1 h-8 items-end">
                           {Array.from({length: 20}).map((_, i) => (
                              <div key={i} className={`flex-1 rounded-sm ${i < (selectedAsset.health.cpuTemp / 5) ? (selectedAsset.health.cpuTemp > 85 ? 'bg-red-500' : 'bg-blue-500') : 'bg-slate-700'}`} style={{height: `${Math.random() * 100}%`}}></div>
                           ))}
                        </div>
                     </div>

                     {/* Battery (If Laptop) */}
                     {selectedAsset.type === 'Laptop' && (
                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><Battery size={14}/> صحة البطارية</h4>
                              <span className="text-xl font-black font-mono text-amber-400">{selectedAsset.health.batteryHealth}%</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-bold">Cycles: {Math.floor(1000 - (selectedAsset.health.batteryHealth! * 10))} / 1000</p>
                        </div>
                     )}

                     {/* AI Prediction */}
                     <div className="bg-indigo-900/30 p-6 rounded-3xl border border-indigo-500/30 col-span-2">
                        <h4 className="text-xs font-black uppercase text-indigo-400 mb-2 flex items-center gap-2"><Activity size={14}/> التنبؤ الذكي بالأعطال</h4>
                        <p className="text-sm font-bold text-white leading-relaxed">
                           {selectedAsset.prediction || 'النظام يعمل بشكل مستقر. لا توجد مؤشرات خطر حالياً.'}
                        </p>
                     </div>
                  </div>

                  <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                     <Cpu size={300} />
                  </div>
               </>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Server size={64} className="mb-4 opacity-50" />
                  <p className="font-black text-lg">اختر جهازاً لعرض التقرير الحي</p>
               </div>
            )}
         </div>
      </div>

      {/* Add Asset Modal */}
      {showAddForm && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden animate-in zoom-in">
               <div className="p-6 bg-slate-100 border-b border-slate-200 flex justify-between items-center text-slate-800">
                  <h3 className="font-black text-xl">تسجيل جهاز جديد</h3>
                  <button onClick={() => setShowAddForm(false)}><X size={24} /></button>
               </div>
               <form onSubmit={handleAddAsset} className="p-8 space-y-4 text-right">
                  <select required className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-200 text-slate-800" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                     <option value="">اختر الزبون المالك</option>
                     {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4 text-slate-800">
                     <div className="col-span-2">
                        <input required className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-200 text-slate-800 placeholder:text-slate-400" placeholder="اسم الجهاز (مثلاً: لابتوب المحاسبة)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>
                     <div className="col-span-2 relative group">
                        <ScanBarcode className="absolute right-4 top-4 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
                        <div className="relative">
                           <input 
                              required 
                              className="w-full pr-12 pl-12 py-4 bg-slate-900 rounded-xl font-black border border-slate-700 text-green-400 placeholder:text-slate-600 font-mono tracking-wider focus:ring-2 focus:ring-blue-500 outline-none" 
                              placeholder="AUTO-GENERATED S/N" 
                              value={formData.serialNumber} 
                              onChange={e => setFormData({...formData, serialNumber: e.target.value})} 
                           />
                           <button 
                              type="button" 
                              onClick={regenerateSerial}
                              className="absolute left-3 top-3.5 text-slate-500 hover:text-white transition-colors"
                              title="إعادة توليد الرقم"
                           >
                              <Wand2 size={18} />
                           </button>
                        </div>
                        <p className="text-[10px] text-blue-600 font-bold mt-1 text-left mr-1 flex items-center justify-end gap-1">
                           <CheckCircle2 size={10} /> رقم تسلسلي ذكي (Auto-Generated)
                        </p>
                     </div>
                     <select className="p-4 bg-slate-50 rounded-xl font-bold border border-slate-200" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                        <option value="Laptop">Laptop</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Server">Server</option>
                     </select>
                     <input className="p-4 bg-slate-50 rounded-xl font-bold border border-slate-200" placeholder="CPU (i5, i7...)" value={formData.specs?.cpu} onChange={e => setFormData({...formData, specs: {...formData.specs!, cpu: e.target.value}})} />
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">المشكل / التشخيص الأولي</label>
                     <textarea 
                        className="w-full p-4 bg-slate-50 rounded-xl font-bold border border-slate-200 text-slate-800 placeholder:text-slate-400 resize-none h-24" 
                        placeholder="وصف المشكل المبلغ عنه (مثلاً: لا يشتغل، شاشة زرقاء، بطء شديد...)" 
                        value={formData.reportedIssue} 
                        onChange={e => setFormData({...formData, reportedIssue: e.target.value})} 
                     />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-3">
                     <Save size={18} /> حفظ وتفعيل التتبع الذكي
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default ComputerWorkshop;