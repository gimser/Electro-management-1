
import React, { useState, useEffect } from 'react';
import { AppState, CustomerIssue, IssueStatus, IssueSource, IssueComment, Task, Visit, Client, Technician } from '../types';
import { 
  Plus, Search, Trash2, CheckCircle2, AlertCircle, Clock, User, 
  Filter, ShieldAlert, LifeBuoy, Zap, Lightbulb, Repeat, X, 
  Save, MessageCircle, Facebook, Instagram, Globe, Phone, ImageIcon, 
  Video, Send, UserCheck, Play, ArrowRight, Settings2, 
  History, CheckCircle, Info, Sparkles, Brain, Activity,
  Loader2, BarChart3, Eye, Share2, MessageSquare, Radio,
  MapPin, Navigation, ArrowUpRight
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface CustomerIssuesPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const CustomerIssuesPage: React.FC<CustomerIssuesPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeIssue, setActiveIssue] = useState<CustomerIssue | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [geoSuggestion, setGeoSuggestion] = useState<{techName: string, city: string} | null>(null);
  
  const [formData, setFormData] = useState<Omit<CustomerIssue, 'id' | 'createdAt' | 'comments'>>({
    clientId: '',
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    source: 'Direct',
    category: 'Security & Networks',
    aiInsights: '',
    aiSuggestedSolution: '',
    mediaUrls: []
  });

  // محرك التحليل الجغرافي اللحظي (سيبقى كمقترح ولكن الأولوية للبث العام)
  useEffect(() => {
    if (formData.clientId) {
      const client = state.clients.find(c => c.id === formData.clientId);
      if (client) {
        const today = new Date().toISOString().split('T')[0];
        const nearbyVisit = state.visits.find(v => {
          const vClient = state.clients.find(c => c.id === v.clientId);
          return vClient?.city === client.city && v.date === today && v.status !== 'Cancelled';
        });

        if (nearbyVisit) {
          const tech = state.technicians.find(t => t.id === nearbyVisit.technicianId);
          if (tech) {
            setGeoSuggestion({ techName: tech.name, city: client.city });
          }
        } else {
          setGeoSuggestion(null);
        }
      }
    }
  }, [formData.clientId, state.visits, state.clients, state.technicians]);

  const getSourceIcon = (source: IssueSource) => {
    switch(source) {
      case 'WhatsApp': return <MessageCircle size={14} className="text-green-500" />;
      case 'Facebook': return <Facebook size={14} className="text-blue-600" />;
      case 'Instagram': return <Instagram size={14} className="text-pink-600" />;
      case 'Website': return <Globe size={14} className="text-purple-600" />;
      case 'Phone': return <Phone size={14} className="text-slate-600" />;
      default: return <User size={14} className="text-slate-400" />;
    }
  };

  const getStatusStyle = (status: IssueStatus) => {
    switch(status) {
      case 'Open': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Analyzing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Assigned': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'In-Progress': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Re-opened': return 'bg-red-100 text-red-700 border-red-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const analyzeWithAI = async (title: string, description: string, source: IssueSource) => {
    setIsAiAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this multi-channel support request for Electro GIM Services:
                   Source: ${source}
                   Title: ${title}
                   Description: ${description}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              isCritical: { type: Type.BOOLEAN },
              insight: { type: Type.STRING },
              suggestedReply: { type: Type.STRING }
            },
            required: ["category", "isCritical", "insight", "suggestedReply"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      return { category: 'General', isCritical: false, insight: "تحليل يدوي مطلوب", suggestedReply: "شكراً لتواصلكم." };
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert('الرجاء اختيار الزبون');
    
    const aiResult = await analyzeWithAI(formData.title, formData.description, formData.source);
    const issueId = crypto.randomUUID();
    
    const newIssue: CustomerIssue = {
      ...formData,
      id: issueId,
      createdAt: new Date().toISOString(),
      comments: [],
      category: aiResult.category as any,
      priority: aiResult.isCritical ? 'High' : formData.priority,
      aiInsights: aiResult.insight,
      aiSuggestedSolution: aiResult.suggestedReply
    };

    // سيناريو البث العام (Broadcast System):
    // يتم إرسال المهمة بدون تقني محدد (BROADCAST) لتظهر عند الجميع
    const taskId = crypto.randomUUID();
    const task: Task = {
      id: taskId,
      title: `[بث عام] ${newIssue.title}`,
      clientId: formData.clientId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0,5),
      technician: 'BROADCAST_POOL', // علامة بأنها متاحة للجميع
      status: 'Pending',
      description: formData.description
    };

    const visit: Visit = {
      id: crypto.randomUUID(),
      clientId: formData.clientId,
      technicianId: 'BROADCAST', // هوية البث العام
      taskId: taskId,
      date: task.date,
      scheduledTime: task.time,
      status: 'Planned',
      isBilled: false,
      notes: `بث عام: ${task.title}`
    };

    updateState(prev => ({
      ...prev,
      customerIssues: [...prev.customerIssues, newIssue],
      tasks: [...prev.tasks, task],
      visits: [...(prev.visits || []), visit],
      automationLogs: [{
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'ISSUE_BROADCASTED',
        status: 'success',
        details: `تم بث المشكلة "${newIssue.title}" لجميع التقنيين. بانتظار قبول أول استجابة.`
      }, ...(prev.automationLogs || [])]
    }));
    
    setShowForm(false);
    resetForm();
    alert('تم تسجيل البلاغ وبثه فوراً لجميع التقنيين المتاحين.');
  };

  const resetForm = () => {
    setFormData({ 
      clientId: '', title: '', description: '', priority: 'Medium', status: 'Open', 
      source: 'Direct', category: 'General' as any, aiInsights: '', aiSuggestedSolution: '', mediaUrls: [] 
    });
    setGeoSuggestion(null);
  };

  const filteredIssues = (state.customerIssues || []).filter(iss => {
    const client = state.clients.find(c => c.id === iss.clientId);
    const matchesSearch = iss.title.toLowerCase().includes(search.toLowerCase()) || 
                         (client?.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || iss.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Share2 className="text-blue-600" size={32} /> مركز الدعم والبث الموحد
          </h2>
          <p className="text-slate-500 font-medium">استقبال البلاغات وبثها لحظياً لجميع كفاءات الميدان</p>
        </div>
        <div className="flex gap-4">
           <div className="hidden lg:flex items-center gap-4 bg-blue-50 px-6 py-2 rounded-2xl border border-blue-100 shadow-sm ml-4">
              <Radio size={18} className="text-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">نظام البث الفوري نشط</span>
           </div>
           <button 
             onClick={() => setShowForm(true)}
             className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all"
           >
             <Plus size={20} /> تسجيل وبث بلاغ جديد
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar Stats */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" /> تحليل القنوات
               </h3>
               <div className="space-y-4">
                  {['WhatsApp', 'Instagram', 'Facebook', 'Direct'].map(src => (
                     <div key={src} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           {getSourceIcon(src as any)}
                           <span className="text-xs font-black text-slate-700">{src}</span>
                        </div>
                        <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-md">
                           {state.customerIssues.filter(i => i.source === src).length}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Main List */}
         <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-4">
               <div className="relative flex-1">
                  <Search className="absolute right-4 top-3 text-slate-400" size={18} />
                  <input 
                    className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="بحث في سجل البلاغات..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
                  {['All', 'Open', 'Assigned', 'Resolved'].map((stat) => (
                    <button 
                      key={stat}
                      onClick={() => setStatusFilter(stat as any)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${statusFilter === stat ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                    >
                      {stat === 'All' ? 'الكل' : stat}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {filteredIssues.slice().reverse().map(issue => {
                  const client = state.clients.find(c => c.id === issue.clientId);
                  return (
                     <div key={issue.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className="p-8 flex-1">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex gap-2">
                                 <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
                                    {getSourceIcon(issue.source)}
                                    <span className="text-[9px] font-black text-slate-600 uppercase">{issue.source}</span>
                                 </div>
                                 <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase border ${getStatusStyle(issue.status)}`}>
                                    {issue.status}
                                 </span>
                              </div>
                              <span className="text-[10px] font-black text-slate-300 font-mono">#{issue.id.slice(0,6)}</span>
                           </div>

                           <div className="mb-4">
                              <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest mb-1 inline-block">
                                 {issue.category || 'General'}
                              </span>
                              <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{issue.title}</h3>
                           </div>

                           <div className="flex items-center gap-3 mb-6 text-slate-500 bg-slate-50/50 p-3 rounded-2xl">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black">
                                 {client?.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-xs font-black text-slate-800">{client?.name || '---'}</p>
                                 <p className="text-[9px] font-bold text-slate-400">{client?.city}</p>
                              </div>
                           </div>

                           <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                              {issue.description}
                           </p>
                        </div>

                        <div className="px-8 pb-8 flex gap-2">
                           <button 
                              onClick={() => setActiveIssue(issue)}
                              className="flex-1 bg-slate-900 text-white text-[10px] font-black py-4 rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                           >
                              <MessageSquare size={16} /> متابعة التفاصيل
                           </button>
                           <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[160] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-blue-900 tracking-tighter uppercase">بث بلاغ زبون جديد</h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">سيظهر هذا البلاغ عند جميع التقنيين فور حفظه</p>
                 </div>
                 <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">اختيار الزبون</label>
                       <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                          <option value="">-- اختر الزبون من القائمة --</option>
                          {state.clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
                       </select>
                    </div>

                    <div className="col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">قناة الورود</label>
                       <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {['WhatsApp', 'Facebook', 'Instagram', 'Website', 'Phone', 'Direct'].map(src => (
                             <button 
                                key={src}
                                type="button"
                                onClick={() => setFormData({...formData, source: src as any})}
                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${formData.source === src ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                             >
                                {getSourceIcon(src as any)}
                                <span className="text-[7px] font-black uppercase">{src}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">عنوان المشكل</label>
                       <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="مثال: عطل في جهاز الربط" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">وصف التفاصيل</label>
                    <textarea required rows={4} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none shadow-inner" placeholder="اكتب تفاصيل المشكل للتقني..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
                 <button 
                   type="submit" 
                   disabled={isAiAnalyzing}
                   className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
                 >
                    {isAiAnalyzing ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    {isAiAnalyzing ? 'جاري التحليل والبث...' : 'تثبيت وبدء البث العام'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerIssuesPage;
