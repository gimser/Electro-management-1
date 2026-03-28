
import React, { useState, useEffect } from 'react';
/* Removed non-existent SocialMessage import from types */
import { AppState, MetaIntegration } from '../types';
import { 
  Zap, Share2, MessageCircle, Facebook, Instagram, 
  Key, ShieldCheck, RefreshCw, Loader2, Link,
  CheckCircle2, AlertTriangle, Terminal, Send, Info,
  ExternalLink, Code, Trash2
} from 'lucide-react';
import { ApiService } from '../services/api';

interface OmnichannelControlProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const OmnichannelControl: React.FC<OmnichannelControlProps> = ({ state, updateState }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const config = state.settings.metaConfig || {
    whatsappEnabled: false,
    facebookEnabled: false,
    instagramEnabled: false,
    verifyToken: 'GIM_CORE_SECURE_2026',
    accessToken: '',
    phoneNumberId: ''
  };

  const [logs, setLogs] = useState<any[]>([]);
  const [pendingLeads, setPendingLeads] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const resp = await fetch('/api/webhooks/logs');
      if (resp.ok) setLogs(await resp.json());
      
      const pendingResp = await fetch('/api/webhooks/pending');
      if (pendingResp.ok) setPendingLeads(await pendingResp.json());
    } catch (e) {}
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/webhooks/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (e) {}
  };

  const clearPending = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الطلبات المعلقة؟')) {
      try {
        await fetch('/api/webhooks/pending', { method: 'DELETE' });
        setPendingLeads([]);
      } catch (e) {}
    }
  };

  const deletePendingLead = async (id: string) => {
    try {
      await fetch(`/api/webhooks/pending/${id}`, { method: 'DELETE' });
      setPendingLeads(prev => prev.filter(l => l.id !== id));
    } catch (e) {}
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // In production, this would call the actual sync API
      const newLeads = await ApiService.leads.syncFromSocial();
      if (newLeads.length > 0) {
        updateState(prev => {
          const allLeads = [...newLeads, ...prev.leads];
          const seen = new Set();
          const uniqueLeads = allLeads.filter(l => {
            if (seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
          });
          
          const uniqueLogs = prev.webhookLogs; // Logs are not returned by this API currently
          
          return { 
            ...prev, 
            leads: uniqueLeads,
            webhookLogs: uniqueLogs
          };
        });

        // Delete from server's pending list to avoid duplicates on next sync
        for (const lead of newLeads) {
          await ApiService.leads.deletePending(lead.id);
        }

        alert(`تمت مزامنة ${newLeads.length} طلبات جديدة بنجاح.`);
      } else {
        alert('لا توجد طلبات جديدة حالياً.');
      }
    } catch (error) {
      alert('فشل الاتصال بالسيرفر للمزامنة.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-700 pb-24 text-right font-arabic" dir="rtl">
      
      <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">الربط الموحد الرسمي (Omnichannel Hub)</h2>
          <p className="text-slate-500 font-bold mt-1">تفعيل واجهات برمجة التطبيقات (APIs) الرسمية لـ Meta</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
           >
             {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
             مزامنة الرسائل من Worker
           </button>
        </div>

      </div>

      <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl mb-10 flex items-start gap-6">
         <Info className="text-amber-600 shrink-0 mt-1" size={24} />
         <div className="space-y-2">
            <p className="text-amber-900 font-black text-sm">دليل المهندس لإعداد الربط:</p>
            <p className="text-amber-700 text-xs font-bold leading-relaxed">
               1. أنشئ تطبيقاً في <span className="underline">developers.facebook.com</span> من نوع "Business".<br/>
               2. أضف "WhatsApp" و "Messenger" كمنتجات داخل التطبيق.<br/>
               3. في إعدادات Webhook، ضع رابط الـ Worker الخاص بك: <code className="bg-white px-2 py-0.5 rounded">https://your-worker.workers.dev/webhook</code><br/>
               4. استعمل الـ <b>Verify Token</b> الموجود أدناه للتأكيد.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Form Settings */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                        <ShieldCheck size={14} className="text-blue-500" /> Verify Token (Webhook)
                     </label>
                     <div className="relative">
                        <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-mono text-xs font-black text-blue-600 outline-none" value={config.verifyToken} readOnly />
                        <button className="absolute left-3 top-3 p-1.5 hover:bg-white rounded-lg text-slate-400"><Code size={14} /></button>
                     </div>
                     <p className="text-[9px] text-slate-400 font-bold mr-2">تضعه في Meta Dashboard &rarr; Webhook &rarr; Edit Subscription</p>
                  </div>

                  <div className="space-y-3">
                     <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                        <MessageCircle size={14} className="text-green-500" /> WhatsApp Phone ID
                     </label>
                     <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-mono text-xs font-black outline-none focus:border-blue-500" placeholder="مثلاً: 105829305..." value={config.phoneNumberId} onChange={e => updateState(prev => ({...prev, settings: {...prev.settings, metaConfig: {...config, phoneNumberId: e.target.value}}}))} />
                     <p className="text-[9px] text-slate-400 font-bold mr-2">تجد في Meta Dashboard &rarr; WhatsApp &rarr; API Setup</p>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                     <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                        <Key size={14} className="text-blue-500" /> System User Access Token (Permanent)
                     </label>
                     <input type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-mono text-xs font-black outline-none focus:border-blue-500" placeholder="EAAQ..." value={config.accessToken} onChange={e => updateState(prev => ({...prev, settings: {...prev.settings, metaConfig: {...config, accessToken: e.target.value}}}))} />
                     <p className="text-[9px] text-slate-400 font-bold mr-2">من إعدادات Business Suite &rarr; Users &rarr; System Users (يجب أن يكون Token دائماً)</p>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
                  {[
                     { id: 'whatsappEnabled', name: 'WhatsApp', icon: <MessageCircle size={18} />, color: 'green' },
                     { id: 'facebookEnabled', name: 'Messenger', icon: <Facebook size={18} />, color: 'blue' },
                     { id: 'instagramEnabled', name: 'Instagram', icon: <Instagram size={18} />, color: 'pink' }
                  ].map(chan => (
                     <button 
                        key={chan.id}
                        onClick={() => updateState(prev => ({...prev, settings: {...prev.settings, metaConfig: {...config, [chan.id]: !config[chan.id as keyof MetaIntegration]}}}))}
                        className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${config[chan.id as keyof MetaIntegration] ? `border-${chan.color}-200 bg-${chan.color}-50 text-${chan.color}-600` : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                     >
                        {chan.icon}
                        <span className="text-[10px] font-black uppercase">{chan.name}</span>
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Monitoring Terminal */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-black rounded-[3rem] p-10 text-green-500 shadow-2xl font-mono relative overflow-hidden border-2 border-slate-800 h-[500px] flex flex-col">
               <div className="flex items-center gap-3 mb-8 border-b border-green-900/30 pb-4 shrink-0">
                  <Terminal size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-800">GIM-OS Worker Live Log</span>
               </div>
               <div className="flex-1 space-y-4 text-[10px] leading-relaxed overflow-y-auto custom-scrollbar pr-2" dir="ltr">
                  <p className="text-green-900">[SYS] GIM-OS Hub: Online</p>
                  <p className="text-green-900">[SYS] Webhook Status: Active</p>
                  <p className="text-blue-500">[META] Connection: Ready</p>
                  <p className="text-white font-bold animate-pulse">[WAIT] Listening for incoming leads...</p>
               </div>
               <div className="absolute bottom-6 left-10 right-10">
                  <div className="h-1 bg-green-900/20 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-1/3 animate-progress"></div>
                  </div>
               </div>
            </div>

            {/* Pending Leads Section */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 space-y-4">
               <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                     <Terminal size={16} className="text-blue-400" /> الطلبات المعلقة (Pending Leads)
                  </h4>
                  <div className="flex gap-2">
                     <button onClick={clearPending} className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors" title="مسح الكل">
                        <Trash2 size={14} />
                     </button>
                  </div>
               </div>
               <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {pendingLeads.length === 0 ? (
                     <p className="text-[10px] text-slate-500 font-bold text-center py-4 italic">لا توجد طلبات معلقة للمزامنة</p>
                  ) : (
                     pendingLeads.map((lead, i) => (
                        <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-[10px] flex justify-between items-center">
                           <div className="space-y-1">
                              <div className="text-slate-300 font-bold">{lead.name} - {lead.phone}</div>
                              <div className="text-slate-500 font-mono text-[8px]">{lead.interest} | {new Date(lead.createdAt).toLocaleTimeString()}</div>
                           </div>
                           <button onClick={() => deletePendingLead(lead.id)} className="text-slate-500 hover:text-red-400 p-1">
                              <Trash2 size={12} />
                           </button>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* Webhook Logs Debug */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 space-y-4">
               <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                     <Terminal size={16} className="text-blue-400" /> آخر الطلبات المستلمة (Debug)
                  </h4>
                  <div className="flex gap-2">
                     <button onClick={clearLogs} className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors" title="مسح السجل">
                        <Trash2 size={14} />
                     </button>
                     <button onClick={fetchLogs} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                     </button>
                  </div>
               </div>
               <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {logs.length === 0 ? (
                     <p className="text-[10px] text-slate-500 font-bold text-center py-4 italic">لا توجد طلبات مستلمة مؤخراً</p>
                  ) : (
                     logs.map((log, i) => (
                        <div key={i} className={`bg-slate-800/50 p-3 rounded-xl border ${log.status === 'REJECTED' ? 'border-red-900/50' : 'border-slate-700/50'} text-[10px] space-y-1`}>
                           <div className="flex justify-between text-slate-500 font-mono">
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              <span className={log.status === 'REJECTED' ? 'text-red-500' : 'text-green-500'}>{log.status}</span>
                           </div>
                           <div className="text-slate-300 font-bold truncate">
                               {log.status === 'REJECTED' ? (
                                 <span className="text-red-400">خطأ: {log.reason}</span>
                               ) : (
                                 <>{log.payload.name || log.payload.company || 'Unknown'} - {log.payload.phone}</>
                               )}
                           </div>
                           {log.status === 'REJECTED' && (
                              <div className="text-[8px] text-slate-500 font-mono truncate">
                                Payload: {JSON.stringify(log.payload)}
                              </div>
                           )}
                        </div>
                     ))
                  )}
               </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <ExternalLink size={20} />
                  <h4 className="font-black text-sm uppercase">رابط الدعم الفني</h4>
               </div>
               <p className="text-[10px] font-bold text-blue-100 leading-relaxed">
                  إذا واجهت صعوبة في استخراج "Access Token" الدائم، تواصل مع فريق التطوير في GIM للقيام بالربط الفني عبر مشاركة الشاشة.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OmnichannelControl;
