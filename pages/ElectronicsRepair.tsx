import React, { useState, useEffect, useRef } from 'react';
import { AppState, ComputerAsset, CustomerIssue } from '../types';
import { generateAutoSerialNumber, createRecord } from '../db';
import { useAuth } from '../context/AuthContext';
import { 
  Monitor, Laptop, Smartphone, Search, Plus, 
  Wrench, CheckCircle2, Clock, AlertTriangle, 
  Save, X, User, QrCode, FileText, ArrowRight,
  HardDrive, Cpu, Battery, Settings, PenTool,
  Activity, Camera, PauseCircle, Play, Timer,
  History, AlertOctagon, StickyNote
} from 'lucide-react';

interface ElectronicsRepairProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  view: 'dashboard' | 'reception' | 'workbench';
}

const ElectronicsRepair: React.FC<ElectronicsRepairProps> = ({ state, updateState, view }) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState(view);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATES ---
  // Reception Form
  const [receptionForm, setReceptionForm] = useState({
    clientId: '',
    deviceType: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    problem: '',
    accessories: '',
    isUrgent: false,
    externalCondition: [] as string[], // New: Condition Tags
    customCondition: '',
    photos: [] as string[], // New: Photo URLs (base64 or mock)
    hasSignature: false // New: Signature Check
  });

  // Workbench Logic
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  // Auto-generate serial if empty on mount/change
  useEffect(() => {
    if (activeTab === 'reception' && !receptionForm.serialNumber) {
      setReceptionForm(prev => ({
        ...prev,
        serialNumber: generateAutoSerialNumber('PC', state.computerAssets.length + Math.floor(Math.random()*1000))
      }));
    }
  }, [activeTab]);

  // --- WORKBENCH TIMER LOGIC (Optimized) ---
  const [liveTimers, setLiveTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const workingTickets = state.customerIssues.filter(iss => iss.workStatus === 'Working' && iss.lastStartedAt);
      if (workingTickets.length > 0) {
        const now = new Date().getTime();
        const updates: Record<string, number> = {};
        workingTickets.forEach(ticket => {
          const startTime = new Date(ticket.lastStartedAt!).getTime();
          const elapsedMinutes = Math.floor((now - startTime) / 60000);
          updates[ticket.id] = (ticket.laborTime || 0) + elapsedMinutes;
        });
        setLiveTimers(updates);
      }
    }, 10000); // Update UI every 10 seconds for smoothness without heavy state updates
    return () => clearInterval(interval);
  }, [state.customerIssues]);

  // Sync labor time to DB every 5 minutes for persistence
  useEffect(() => {
    const interval = setInterval(() => {
      const workingTickets = state.customerIssues.filter(iss => iss.workStatus === 'Working' && iss.lastStartedAt);
      if (workingTickets.length > 0) {
        const now = new Date().toISOString();
        updateState(prev => ({
          ...prev,
          customerIssues: prev.customerIssues.map(iss => {
            if (iss.workStatus === 'Working' && iss.lastStartedAt) {
              const startTime = new Date(iss.lastStartedAt).getTime();
              const nowTime = new Date(now).getTime();
              const elapsedMinutes = Math.floor((nowTime - startTime) / 60000);
              return {
                ...iss,
                laborTime: (iss.laborTime || 0) + elapsedMinutes,
                lastStartedAt: now // Reset start time to now to avoid double counting
              };
            }
            return iss;
          })
        }));
      }
    }, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [state.customerIssues]);

  // --- ACTIONS ---

  const handleReceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      if (!receptionForm.clientId) throw new Error('يرجى اختيار الزبون');
      if (!receptionForm.hasSignature) throw new Error('توقيع الزبون إجباري لبدء الإصلاح (موافقة على الشروط)');
      if (receptionForm.photos.length === 0) throw new Error('الصور إجبارية لتوثيق حالة الجهاز عند الاستلام');

      // 1. Create Asset
      const newAsset = createRecord<ComputerAsset>({
        clientId: receptionForm.clientId,
        name: `${receptionForm.brand} ${receptionForm.model}`,
        serialNumber: receptionForm.serialNumber,
        type: receptionForm.deviceType as any,
        specs: { cpu: 'N/A', ram: 'N/A', disk: 'N/A', gpu: 'N/A' },
        health: { status: 'Warning', diskLife: 100, cpuTemp: 0, lastBootTime: new Date().toISOString(), bluescreenCount: 0 },
        reportedIssue: receptionForm.problem,
        agentInstalled: false,
        lastSync: new Date().toISOString(),
        prediction: 'Under Repair'
      });

      // 2. Create Issue Ticket with Extended Data
      const fullCondition = [...receptionForm.externalCondition, receptionForm.customCondition].filter(Boolean).join(', ');
      
      const newIssue = createRecord<CustomerIssue>({
        assetId: newAsset.id, // Link Asset
        clientId: receptionForm.clientId,
        title: `إصلاح: ${receptionForm.deviceType} - ${receptionForm.brand}`,
        description: `${receptionForm.problem} \n ملحقات: ${receptionForm.accessories}`,
        priority: receptionForm.isUrgent ? 'High' : 'Medium',
        status: 'Open',
        source: 'Direct',
        category: 'GIM Store',
        mediaUrls: receptionForm.photos,
        externalCondition: fullCondition,
        customerSignature: 'Signed-Token-Base64', // Mock Signature
        laborTime: 0,
        workStatus: 'Pending'
      });

      updateState(prev => ({
        ...prev,
        computerAssets: [...prev.computerAssets, newAsset],
        customerIssues: [...prev.customerIssues, newIssue],
        activityLogs: [createRecord({
          userId: authUser?.id || 'system',
          username: authUser?.fullName || 'System',
          action: 'DEVICE_RECEIVED',
          module: 'WORKSHOP',
          timestamp: new Date().toISOString(),
          details: `تم استلام جهاز ${newAsset.name} (S/N: ${newAsset.serialNumber}) مع توثيق الحالة والصور.`,
          severity: 'Info'
        }), ...(prev.activityLogs || [])]
      }));

      showToast('تم تسجيل الجهاز وفتح تذكرة الإصلاح بنجاح!', 'success');
      setReceptionForm({ 
          clientId: '', deviceType: 'Laptop', brand: '', model: '', 
          serialNumber: '', problem: '', accessories: '', isUrgent: false,
          externalCondition: [], customCondition: '', photos: [], hasSignature: false
      });
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ غير متوقع', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCondition = (cond: string) => {
      setReceptionForm(prev => {
          const exists = prev.externalCondition.includes(cond);
          return {
              ...prev,
              externalCondition: exists 
                ? prev.externalCondition.filter(c => c !== cond)
                : [...prev.externalCondition, cond]
          };
      });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // File size validation (Max 5MB)
          if (file.size > 5 * 1024 * 1024) {
              return showToast('حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)', 'error');
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              setReceptionForm(prev => ({...prev, photos: [...prev.photos, base64String]}));
          };
          reader.readAsDataURL(file);
      }
  };

  const triggerPhotoUpload = () => {
      fileInputRef.current?.click();
  };

  // --- WORKBENCH ACTIONS ---

  const toggleTimer = (ticket: CustomerIssue) => {
      if (ticket.workStatus === 'Working') {
          // Pause logic
          setActiveTicketId(ticket.id);
          setShowPauseModal(true);
      } else {
          // Start logic
          updateState(prev => ({
              ...prev,
              customerIssues: prev.customerIssues.map(iss => 
                  iss.id === ticket.id ? { 
                    ...iss, 
                    workStatus: 'Working', 
                    lastStartedAt: new Date().toISOString(),
                    pauseReason: undefined 
                  } : iss
              )
          }));
          setActiveTicketId(ticket.id);
          showToast('بدأ تسجيل وقت العمل', 'info');
      }
  };

  const confirmPause = () => {
      if (!activeTicketId) return;
      const now = new Date().toISOString();
      updateState(prev => ({
          ...prev,
          customerIssues: prev.customerIssues.map(iss => {
              if (iss.id === activeTicketId) {
                const startTime = iss.lastStartedAt ? new Date(iss.lastStartedAt).getTime() : new Date().getTime();
                const nowTime = new Date(now).getTime();
                const elapsedMinutes = Math.floor((nowTime - startTime) / 60000);
                return { 
                  ...iss, 
                  workStatus: 'Paused', 
                  pauseReason: pauseReason,
                  laborTime: (iss.laborTime || 0) + elapsedMinutes,
                  lastStartedAt: undefined
                };
              }
              return iss;
          })
      }));
      setShowPauseModal(false);
      setPauseReason('');
      setActiveTicketId(null);
      showToast('تم إيقاف تسجيل الوقت وحفظ التقدم', 'success');
  };

  const getAssetHistory = (assetId?: string) => {
      if (!assetId) return [];
      // Find resolved tickets for this asset
      return state.customerIssues.filter(i => 
          i.assetId === assetId && 
          i.status === 'Resolved'
      );
  };

  const getFilteredRepairJobs = () => {
    return state.customerIssues.filter(iss => 
      ['Open', 'Assigned', 'In-Progress'].includes(iss.status) &&
      (iss.title.includes('إصلاح') || iss.category === 'GIM Store')
    ).map(iss => {
      const client = state.clients.find(c => c.id === iss.clientId);
      return { ...iss, clientName: client?.name };
    }).filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // --- RENDERERS ---

  const renderDashboard = () => {
    const totalJobs = state.customerIssues.filter(i => i.status !== 'Resolved').length;
    const urgentJobs = state.customerIssues.filter(i => i.priority === 'High' && i.status !== 'Resolved').length;
    const readyJobs = state.customerIssues.filter(i => i.status === 'Diagnosed').length;

    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">أجهزة قيد الانتظار</p>
              <p className="text-4xl font-black text-slate-800">{totalJobs}</p>
              <Clock className="absolute -left-4 -bottom-4 text-slate-100 w-24 h-24" />
           </div>
           <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">حالات مستعجلة</p>
              <p className="text-4xl font-black text-red-600">{urgentJobs}</p>
              <AlertTriangle className="absolute -left-4 -bottom-4 text-red-100 w-24 h-24" />
           </div>
           <div className="bg-green-50 p-8 rounded-[2.5rem] border border-green-100 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">جاهز للتسليم</p>
              <p className="text-4xl font-black text-green-600">{readyJobs}</p>
              <CheckCircle2 className="absolute -left-4 -bottom-4 text-green-100 w-24 h-24" />
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={24} className="text-blue-600" /> النشاط الأخير في الورشة
           </h3>
           <div className="space-y-4">
              {state.activityLogs
                ?.filter(l => l.module === 'WORKSHOP' || l.module === 'TECHNICAL')
                .slice(0, 5)
                .map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className={`w-2 h-2 rounded-full ${log.severity === 'Info' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                     <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">{log.details}</p>
                        <p className="text-[9px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString('ar-MA')}</p>
                     </div>
                     <span className="text-[9px] font-black bg-white px-2 py-1 rounded border uppercase">{log.username}</span>
                  </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const renderReception = () => (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl max-w-4xl mx-auto animate-in slide-in-from-bottom-4">
       <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg">
             <FileText size={32} />
          </div>
          <div>
             <h2 className="text-2xl font-black text-slate-800">استمارة استقبال جهاز</h2>
             <p className="text-slate-500 text-xs font-bold">توثيق الحالة، الصور، وتوقيع الزبون (إلزامي)</p>
          </div>
       </div>

       <form onSubmit={handleReceptionSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">الزبون المالك</label>
                <select 
                   required
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                   value={receptionForm.clientId}
                   onChange={e => setReceptionForm({...receptionForm, clientId: e.target.value})}
                >
                   <option value="">اختر الزبون...</option>
                   {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             
             <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">نوع الجهاز</label>
                <div className="flex gap-2">
                   {['Laptop', 'Desktop', 'Console', 'Phone'].map(type => (
                      <button
                         key={type}
                         type="button"
                         onClick={() => setReceptionForm({...receptionForm, deviceType: type})}
                         className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${receptionForm.deviceType === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                         {type}
                      </button>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">العلامة التجارية (Brand)</label>
                <input 
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="HP, Dell, Apple..."
                   value={receptionForm.brand}
                   onChange={e => setReceptionForm({...receptionForm, brand: e.target.value})}
                />
             </div>

             <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">الموديل (Model)</label>
                <input 
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="Inspiron 15 3000..."
                   value={receptionForm.model}
                   onChange={e => setReceptionForm({...receptionForm, model: e.target.value})}
                />
             </div>

             <div className="md:col-span-2 space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">الرقم التسلسلي (S/N) - يُولد تلقائياً</label>
                <div className="relative">
                   <QrCode className="absolute left-4 top-4 text-slate-400" size={20} />
                   <input 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl font-mono font-black text-blue-700 outline-none"
                      value={receptionForm.serialNumber}
                      onChange={e => setReceptionForm({...receptionForm, serialNumber: e.target.value})}
                   />
                </div>
             </div>

             {/* Visual Inspection Section */}
             <div className="md:col-span-2 space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 border-dashed">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-amber-500" /> الفحص الظاهري (الحالة الخارجية)
                </label>
                <div className="flex flex-wrap gap-3">
                    {['خدوش', 'كسر في الشاشة', 'أزرار مفقودة', 'هيكل متضرر', 'آثار سوائل', 'سليم ظاهرياً'].map(cond => (
                        <button
                            key={cond}
                            type="button"
                            onClick={() => toggleCondition(cond)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                receptionForm.externalCondition.includes(cond)
                                ? 'bg-amber-100 border-amber-300 text-amber-800'
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}
                        >
                            {cond}
                        </button>
                    ))}
                </div>
                <input 
                   className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                   placeholder="ملاحظات إضافية حول الحالة..."
                   value={receptionForm.customCondition}
                   onChange={e => setReceptionForm({...receptionForm, customCondition: e.target.value})}
                />
             </div>

             {/* Photos Section */}
             <div className="md:col-span-2 space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">توثيق الصور (إجباري)</label>
                <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handlePhotoUpload} 
                />
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <button 
                        type="button"
                        onClick={triggerPhotoUpload}
                        className="w-24 h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all shrink-0"
                    >
                        <Camera size={24} />
                        <span className="text-[10px] font-bold mt-1">إضافة</span>
                    </button>
                    {receptionForm.photos.map((url, i) => (
                        <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 relative shrink-0 group">
                            <img src={url} className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => setReceptionForm(prev => ({...prev, photos: prev.photos.filter((_, idx) => idx !== i)}))}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
             </div>

             <div className="md:col-span-2 space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">وصف العطل / المشكلة</label>
                <textarea 
                   required
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                   placeholder="الجهاز لا يقلع، شاشة سوداء، ارتفاع حرارة..."
                   value={receptionForm.problem}
                   onChange={e => setReceptionForm({...receptionForm, problem: e.target.value})}
                />
             </div>

             <div className="md:col-span-2 space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">الملحقات المستلمة (شاحن، حقيبة...)</label>
                <input 
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="شاحن أصلي، حقيبة سوداء..."
                   value={receptionForm.accessories}
                   onChange={e => setReceptionForm({...receptionForm, accessories: e.target.value})}
                />
             </div>

             <div className="md:col-span-2 bg-blue-50 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="bg-white p-3 rounded-full shadow-sm text-blue-600"><AlertOctagon size={24}/></div>
                   <div>
                      <p className="font-black text-slate-800 text-sm">حالة مستعجلة (VIP)</p>
                      <p className="text-[10px] text-slate-500">أولوية قصوى في الورشة (+ رسوم إضافية)</p>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" className="sr-only peer" checked={receptionForm.isUrgent} onChange={e => setReceptionForm({...receptionForm, isUrgent: e.target.checked})} />
                   <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
             </div>

             <div className="md:col-span-2 flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                <input 
                    type="checkbox" 
                    id="signatureCheck" 
                    className="w-6 h-6 text-blue-600 rounded-lg"
                    checked={receptionForm.hasSignature}
                    onChange={e => setReceptionForm({...receptionForm, hasSignature: e.target.checked})}
                />
                <label htmlFor="signatureCheck" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                    أشهد أنني استلمت الجهاز وقمت بمعاينته وتوقيع الزبون على وصل الاستلام.
                </label>
             </div>
          </div>

          <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
             ) : (
                <Save size={20} />
             )}
             {isLoading ? 'جاري الحفظ...' : 'تأكيد الاستلام وطباعة التذكرة'}
          </button>
       </form>
    </div>
  );

  const renderWorkbench = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4">
       <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
             <h2 className="text-3xl font-black tracking-tighter mb-2">طاولة العمل (Workbench)</h2>
             <p className="text-blue-300 font-bold text-xs">تتبع دقيق لوقت الإصلاح والمهام</p>
          </div>
          <div className="relative z-10 w-96">
             <input 
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-slate-400 font-bold outline-none focus:bg-white/20 transition-all"
                placeholder="بحث برقم التذكرة أو اسم الزبون..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <Wrench className="absolute -left-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
       </div>

       <div className="grid grid-cols-1 gap-6">
          {getFilteredRepairJobs().map(ticket => (
             <div key={ticket.id} className={`bg-white rounded-[2.5rem] p-8 border-2 shadow-sm transition-all relative overflow-hidden ${activeTicketId === ticket.id ? 'border-blue-500 shadow-blue-200' : 'border-slate-100 hover:border-slate-300'}`}>
                {/* Active Indicator Strip */}
                {activeTicketId === ticket.id && <div className="absolute top-0 right-0 h-full w-2 bg-blue-500 animate-pulse"></div>}
                
                <div className="flex justify-between items-start">
                   <div className="flex gap-6">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg ${ticket.priority === 'High' ? 'bg-red-500' : 'bg-slate-900'}`}>
                         <Monitor size={28} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-800 mb-1">{ticket.title}</h3>
                         <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                            <span className="flex items-center gap-1"><User size={12}/> {ticket.clientName}</span>
                            <span>•</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">وقت العمل المسجل</p>
                      <p className="text-3xl font-black font-mono text-blue-600">
                         {Math.floor(((ticket.laborTime || 0) + (liveTimers[ticket.id] || 0)) / 60)}h {((ticket.laborTime || 0) + (liveTimers[ticket.id] || 0)) % 60}m
                      </p>
                   </div>
                </div>

                {/* Progress & Actions */}
                <div className="mt-8 flex items-center gap-6">
                   <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">الحالة الحالية: <span className="text-slate-900 font-black">{ticket.workStatus || 'Pending'}</span></span>
                      {ticket.pauseReason && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded">سبب التوقف: {ticket.pauseReason}</span>}
                   </div>
                   
                   <button 
                      onClick={() => toggleTimer(ticket)}
                      className={`px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg transition-all ${
                         ticket.workStatus === 'Working' 
                         ? 'bg-amber-500 text-white hover:bg-amber-600' 
                         : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                   >
                      {ticket.workStatus === 'Working' ? <PauseCircle size={20} /> : <Play size={20} />}
                      {ticket.workStatus === 'Working' ? 'إيقاف مؤقت' : 'بدء العمل'}
                   </button>

                   <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all flex items-center gap-2">
                      <History size={18} /> السجل
                   </button>
                </div>
             </div>
          ))}
          {getFilteredRepairJobs().length === 0 && (
             <div className="py-20 text-center opacity-40">
                <StickyNote size={64} className="mx-auto mb-4" />
                <p className="font-black text-xl">لا توجد مهام إصلاح مطابقة</p>
             </div>
          )}
       </div>

       {/* Pause Modal */}
       {showPauseModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in">
                <h3 className="text-xl font-black text-slate-800 mb-4">تسجيل سبب التوقف</h3>
                <div className="space-y-3 mb-6">
                   {['انتظار قطع غيار', 'انتظار موافقة الزبون', 'انتهاء الدوام', 'أخرى'].map(reason => (
                      <button 
                         key={reason}
                         onClick={() => setPauseReason(reason)}
                         className={`w-full p-3 rounded-xl font-bold text-xs border-2 transition-all ${pauseReason === reason ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                      >
                         {reason}
                      </button>
                   ))}
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setShowPauseModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs">إلغاء</button>
                   <button onClick={confirmPause} disabled={!pauseReason} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-xs disabled:opacity-50">تأكيد الإيقاف</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );

  return (
    <div className="p-8 pb-24 text-right font-arabic" dir="rtl">
       {/* Tab Navigation */}
       <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200 inline-flex gap-2">
             <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-8 py-3 rounded-3xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Activity size={16} /> نظرة عامة
             </button>
             <button 
                onClick={() => setActiveTab('reception')}
                className={`px-8 py-3 rounded-3xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'reception' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <FileText size={16} /> الاستقبال
             </button>
             <button 
                onClick={() => setActiveTab('workbench')}
                className={`px-8 py-3 rounded-3xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'workbench' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                <Wrench size={16} /> طاولة العمل
             </button>
          </div>
       </div>

       {activeTab === 'dashboard' && renderDashboard()}
       {activeTab === 'reception' && renderReception()}
       {activeTab === 'workbench' && renderWorkbench()}

       {/* Toast Notification */}
       {toast && (
         <div className={`fixed bottom-8 left-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-left-4 ${
           toast.type === 'success' ? 'bg-green-600 text-white' : 
           toast.type === 'error' ? 'bg-red-600 text-white' : 
           'bg-blue-600 text-white'
         }`}>
           {toast.type === 'success' ? <CheckCircle2 size={20} /> : 
            toast.type === 'error' ? <AlertTriangle size={20} /> : 
            <Activity size={20} />}
           <span className="font-black text-xs">{toast.message}</span>
         </div>
       )}
    </div>
  );
};

export default ElectronicsRepair;