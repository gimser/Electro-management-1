import React, { useState } from 'react';
import { AppState, SecurityAudit, Vulnerability, ZeroTrustStatus } from '../types';
import { 
  ShieldAlert, Lock, Network, Fingerprint, 
  Activity, Search, Plus, Trash2, Eye, 
  CheckCircle2, XCircle, AlertTriangle, 
  FileText, Shield, User, Server, Target,
  Layers, Wifi, Box, Radio
} from 'lucide-react';
import { createRecord } from '../db';
import { useAuth } from '../context/AuthContext';

interface SecurityAuditPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SecurityAuditPage: React.FC<SecurityAuditPageProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);
  const [isRunningScan, setIsRunningScan] = useState(false);

  const selectedAudit = state.securityAudits?.find(a => a.id === selectedAuditId);

  // New Audit Form State
  const [newAudit, setNewAudit] = useState<{clientId: string, scope: string}>({
    clientId: '',
    scope: ''
  });

  const handleRunAudit = () => {
    if (!newAudit.clientId) return alert("اختر زبوناً للتدقيق.");
    setIsRunningScan(true);

    // Simulate Scan Process
    setTimeout(() => {
        const clientName = state.clients.find(c => c.id === newAudit.clientId)?.name;
        
        const identityScore = Math.floor(Math.random() * 40) + 60; // 60-100
        const networkScore = Math.floor(Math.random() * 50) + 40;
        const endpointScore = Math.floor(Math.random() * 60) + 30;
        const overallScore = Math.floor((identityScore + networkScore + endpointScore) / 3);

        // Mock Results based on "HackerAI" Logic
        const mockAudit = createRecord<SecurityAudit>({
            clientId: newAudit.clientId,
            date: new Date().toISOString().split('T')[0],
            technician: 'System AI',
            scope: newAudit.scope || 'Full Network Scan',
            zeroTrustStatus: {
                identityScore,
                networkScore,
                endpointScore,
                overallScore,
                lastAuditDate: new Date().toISOString()
            },
            vulnerabilities: []
        });

        updateState(prev => ({
            ...prev,
            securityAudits: [mockAudit, ...(prev.securityAudits || [])],
            activityLogs: [createRecord({
                userId: authUser?.id || 'system',
                username: authUser?.fullName || 'System',
                action: 'SECURITY_AUDIT_RUN',
                module: 'SECURITY',
                timestamp: new Date().toISOString(),
                details: `Zero Trust Audit executed for ${clientName}`,
                severity: 'Info'
            }), ...(prev.activityLogs || [])]
        }));

        setIsRunningScan(false);
        setShowNewAuditForm(false);
        setSelectedAuditId(mockAudit.id);
    }, 2500);
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-500';
      if (score >= 50) return 'text-amber-500';
      return 'text-red-500';
  };

  return (
    <div className="p-8 h-screen bg-[#020617] text-slate-200 font-mono overflow-hidden flex flex-col" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
         <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase">
               <ShieldAlert className="text-red-600 animate-pulse" size={32} /> مركز الدفاع السيبراني (CDC)
            </h2>
            <p className="text-slate-500 font-bold text-xs mt-1">Zero Trust Architecture & Vulnerability Management</p>
         </div>
         <button 
            onClick={() => setShowNewAuditForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
         >
            <Activity size={18} /> بدء فحص جديد
         </button>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
         
         {/* Sidebar List */}
         <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">سجل التدقيق (Audit Logs)</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
               {(state.securityAudits || []).map(audit => {
                  const client = state.clients.find(c => c.id === audit.clientId);
                  return (
                     <div 
                        key={audit.id}
                        onClick={() => setSelectedAuditId(audit.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                           selectedAuditId === audit.id 
                           ? 'bg-slate-800 border-red-500/50 shadow-lg' 
                           : 'bg-transparent border-slate-800 hover:border-slate-600'
                        }`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <h4 className="font-bold text-white text-sm">{client?.name}</h4>
                              <p className="text-[10px] text-slate-500">{audit.date}</p>
                           </div>
                           <div className={`text-xl font-black ${getScoreColor(audit.zeroTrustStatus.overallScore)}`}>
                              {audit.zeroTrustStatus.overallScore}%
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <span className="text-[9px] bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-700">{audit.vulnerabilities.length} Vulns</span>
                           <span className="text-[9px] bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-700">{audit.scope}</span>
                        </div>
                     </div>
                  );
               })}
               {(!state.securityAudits || state.securityAudits.length === 0) && (
                   <div className="text-center py-10 opacity-30">
                       <Shield size={48} className="mx-auto mb-2" />
                       <p className="text-xs">لا توجد تقارير أمنية</p>
                   </div>
               )}
            </div>
         </div>

         {/* Main Detail View */}
         <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 p-8 overflow-y-auto custom-scrollbar relative">
            {selectedAudit ? (
               <div className="space-y-8">
                  {/* Score Dashboard */}
                  <div className="grid grid-cols-3 gap-6">
                     <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                        <Fingerprint className="mx-auto mb-2 text-blue-500" size={24} />
                        <p className="text-[10px] uppercase text-slate-400 font-black">Identity (IAM)</p>
                        <p className="text-2xl font-black text-white">{selectedAudit.zeroTrustStatus.identityScore}%</p>
                     </div>
                     <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                        <Network className="mx-auto mb-2 text-purple-500" size={24} />
                        <p className="text-[10px] uppercase text-slate-400 font-black">Network (Segmentation)</p>
                        <p className="text-2xl font-black text-white">{selectedAudit.zeroTrustStatus.networkScore}%</p>
                     </div>
                     <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                        <Server className="mx-auto mb-2 text-green-500" size={24} />
                        <p className="text-[10px] uppercase text-slate-400 font-black">Endpoint (EDR)</p>
                        <p className="text-2xl font-black text-white">{selectedAudit.zeroTrustStatus.endpointScore}%</p>
                     </div>
                  </div>

                  {/* Network Segmentation Analysis (IoT List) */}
                  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Layers className="text-blue-400" /> تحليل تقسيم الشبكة (Network Segmentation)
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* IoT Segment */}
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-600">
                           <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                                 <Wifi size={14} /> شبكة إنترنت الأشياء (IoT VLAN)
                              </div>
                              <span className="bg-amber-900/30 text-amber-400 text-[9px] px-2 py-1 rounded border border-amber-700/50">
                                 Isolation Check
                              </span>
                           </div>
                           <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                              {(state.iotDevices || []).filter(d => d.clientId === selectedAudit.clientId).map(dev => (
                                 <div key={dev.id} className="flex justify-between items-center text-xs p-2 hover:bg-white/5 rounded transition-colors">
                                    <span className="text-slate-300 flex items-center gap-2">
                                       <Box size={10} /> {dev.name}
                                    </span>
                                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${dev.networkSegment === 'IoT_Isolated' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                       {dev.networkSegment || 'UNSECURED'}
                                    </span>
                                 </div>
                              ))}
                              {(state.iotDevices || []).filter(d => d.clientId === selectedAudit.clientId).length === 0 && (
                                 <p className="text-slate-600 text-[10px] italic">لا توجد أجهزة IoT مسجلة لهذا الزبون.</p>
                              )}
                           </div>
                        </div>

                        {/* Corporate Segment */}
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-600">
                           <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                              <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase">
                                 <Server size={14} /> الشبكة الأساسية (Corporate VLAN)
                              </div>
                              <span className="bg-blue-900/30 text-blue-400 text-[9px] px-2 py-1 rounded border border-blue-700/50">
                                 Secure Zone
                              </span>
                           </div>
                           <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                              {(state.networkDevices || []).filter(d => d.clientId === selectedAudit.clientId).map(dev => (
                                 <div key={dev.id} className="flex justify-between items-center text-xs p-2 hover:bg-white/5 rounded transition-colors">
                                    <span className="text-slate-300 flex items-center gap-2">
                                       <Radio size={10} /> {dev.name}
                                    </span>
                                    <span className="text-slate-500 text-[9px] font-mono">{dev.ip}</span>
                                 </div>
                              ))}
                              {(state.networkDevices || []).filter(d => d.clientId === selectedAudit.clientId).length === 0 && (
                                 <p className="text-slate-600 text-[10px] italic">لا توجد أجهزة شبكة مسجلة.</p>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Vulnerabilities Table */}
                  <div>
                     <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" /> الثغرات المكتشفة (Findings)
                     </h3>
                     <div className="space-y-3">
                        {selectedAudit.vulnerabilities.map((vuln, i) => (
                           <div key={i} className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl flex justify-between items-center group hover:bg-slate-800 transition-all">
                              <div className="flex items-start gap-4">
                                 <div className={`mt-1 w-2 h-2 rounded-full ${vuln.riskLevel === 'Critical' ? 'bg-red-600 shadow-[0_0_10px_red]' : vuln.riskLevel === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                                 <div>
                                    <h4 className="font-bold text-white text-sm">
                                       {vuln.title} 
                                       {vuln.cve && <span className="mr-2 text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{vuln.cve}</span>}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1">Fix: {vuln.remediation}</p>
                                 </div>
                              </div>
                              <div className="text-left">
                                 <span className={`text-[10px] font-black uppercase px-3 py-1 rounded border ${
                                    vuln.status === 'Open' ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-green-900/20 text-green-400 border-green-900/50'
                                 }`}>
                                    {vuln.status}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Recommendation Action */}
                  <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl flex items-center gap-4">
                     <FileText className="text-blue-400 shrink-0" size={32} />
                     <div>
                        <h4 className="text-blue-100 font-bold text-sm">تقرير الزبون جاهز</h4>
                        <p className="text-blue-300/70 text-xs">تم توليد تقرير PDF يحتوي على خطة العمل (Action Plan) لتطبيق Zero Trust.</p>
                     </div>
                     <button className="mr-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-black transition-all">
                        تصدير التقرير
                     </button>
                  </div>

               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                  <ShieldAlert size={80} />
                  <p className="font-black text-lg">اختر تقريراً لعرض التفاصيل</p>
               </div>
            )}
         </div>
      </div>

      {/* New Audit Modal */}
      {showNewAuditForm && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative overflow-hidden">
               {isRunningScan ? (
                  <div className="text-center py-10 space-y-6">
                     <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                     <h3 className="text-xl font-black text-white animate-pulse">جاري فحص الشبكة...</h3>
                     <div className="font-mono text-xs text-green-500 text-left h-24 overflow-hidden border border-slate-800 bg-black p-4 rounded-xl">
                        &gt; Initializing Nmap scan...<br/>
                        &gt; Checking Active Directory...<br/>
                        &gt; Probing Endpoints...<br/>
                        &gt; Analyzing Traffic Patterns...
                     </div>
                  </div>
               ) : (
                  <>
                     <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Target size={24} className="text-red-500" /> إعداد عملية الفحص
                     </h3>
                     <div className="space-y-4 mb-8">
                        <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2">الهدف (Client)</label>
                           <select 
                              className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-red-500 transition-all"
                              value={newAudit.clientId}
                              onChange={e => setNewAudit({...newAudit, clientId: e.target.value})}
                           >
                              <option value="">-- اختر الهدف --</option>
                              {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2">نطاق الفحص (Scope)</label>
                           <input 
                              className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-red-500 transition-all font-mono placeholder:text-slate-600"
                              placeholder="e.g., 192.168.1.0/24, domain.com"
                              value={newAudit.scope}
                              onChange={e => setNewAudit({...newAudit, scope: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setShowNewAuditForm(false)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all">إلغاء</button>
                        <button onClick={handleRunAudit} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">تشغيل الفحص</button>
                     </div>
                  </>
               )}
            </div>
         </div>
      )}

    </div>
  );
};

export default SecurityAuditPage;