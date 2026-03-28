
import React, { useState } from 'react';
import { AppState, AutomationRule, AutomationTrigger } from '../types';
import { 
  FileText, Plus, Trash2, MessageCircle, ClipboardCheck, 
  LayoutGrid, ShieldCheck, Filter, Target, 
  Activity, ArrowRight, Save, X, Zap, Globe, RefreshCw
} from 'lucide-react';

interface AutomationPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const AutomationPage: React.FC<AutomationPageProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'Templates' | 'Integrations'>('Templates');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<AutomationRule, 'id'>>({
    trigger: 'OnNewLead',
    action: 'Template',
    template: '',
    active: true
  });

  const syncExternalLeads = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/webhooks/pending');
      const newLeads = await res.json();
      
      if (newLeads.length > 0) {
        updateState(prev => ({
          ...prev,
          leads: [...newLeads, ...prev.leads],
          automationLogs: [
            {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              username: 'System',
              action: 'WEBHOOK_SYNC',
              status: 'success',
              details: `تم جلب ${newLeads.length} فرصة جديدة من النموذج الخارجي`
            },
            ...(prev.automationLogs || [])
          ]
        }));

        // Clear pending on server
        for (const lead of newLeads) {
          await fetch(`/api/webhooks/pending/${lead.id}`, { method: 'DELETE' });
        }
        alert(`تم جلب ${newLeads.length} فرصة بنجاح!`);
      } else {
        alert('لا توجد فرص جديدة حالياً.');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في المزامنة');
    }
    setIsSyncing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: AutomationRule = { ...formData, id: crypto.randomUUID() };
    updateState(prev => ({
      ...prev,
      automationRules: [...(prev.automationRules || []), newRule]
    }));
    setShowForm(false);
    setFormData({ trigger: 'OnNewLead', action: 'Template', template: '', active: true });
  };

  const deleteRule = (id: string) => {
    if (confirm('حذف هذا القالب؟')) {
      updateState(prev => ({
        ...prev,
        automationRules: prev.automationRules.filter(r => r.id !== id)
      }));
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
            <Zap className="text-blue-600" /> الأتمتة والربط الخارجي
          </h2>
          <p className="text-slate-500 font-medium mt-1">إدارة قوالب الرسائل والربط مع النماذج الخارجية (Google Forms, Typeform)</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
             <button 
               onClick={() => setActiveTab('Templates')}
               className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'Templates' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
             >
               قوالب النصوص
             </button>
             <button 
               onClick={() => setActiveTab('Integrations')}
               className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'Integrations' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
             >
               الربط الخارجي
             </button>
          </div>
          {activeTab === 'Templates' && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all"
            >
              <Plus size={18} /> إضافة قالب نصي
            </button>
          )}
        </div>
      </div>

      {activeTab === 'Templates' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.automationRules?.length > 0 ? state.automationRules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 group transition-all hover:shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                  <MessageCircle size={24} />
                </div>
                <button onClick={() => deleteRule(rule.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md inline-block">نوع القالب: {rule.trigger}</span>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-[100px]">
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed whitespace-pre-wrap italic">
                    "{rule.template}"
                  </p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(rule.template); alert('تم نسخ النص!'); }} className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">نسخ النص للاستخدام</button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
               <p className="text-slate-400 font-black text-xl">لا توجد قوالب مخزنة حالياً.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
           <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-10">
                 <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                          <Globe size={24} />
                       </div>
                       <h3 className="text-2xl font-black text-slate-800">ربط النماذج الخارجية (Webhook)</h3>
                    </div>
                    <p className="text-slate-600 font-bold leading-relaxed">
                       يمكنك ربط أي نموذج خارجي (مثل Google Forms أو Typeform) بنظام GIM-NET TECH لاستقبال الطلبات والزبائن آلياً.
                       استخدم الرابط التالي كـ "Webhook URL" في إعدادات النموذج الخاص بك.
                    </p>
                    
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-inner">
                       <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">رابط الاستقبال (Webhook URL)</label>
                       <div className="flex items-center gap-4">
                          <code className="flex-1 text-blue-400 font-mono text-sm break-all">
                             {window.location.origin}/api/webhooks/external-form
                          </code>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/external-form`); alert('تم نسخ الرابط!'); }}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all"
                          >
                             نسخ الرابط
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                          <h4 className="font-black text-blue-800 mb-2 text-sm">الحقول المطلوبة (JSON):</h4>
                          <ul className="text-[10px] font-bold text-blue-600 space-y-1">
                             <li>• name: اسم الزبون</li>
                             <li>• phone: رقم الهاتف</li>
                             <li>• email: البريد (اختياري)</li>
                             <li>• interest: نوع الخدمة</li>
                          </ul>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <h4 className="font-black text-slate-800 mb-2 text-sm">حالة الربط:</h4>
                          <div className="flex items-center gap-2 text-green-600 font-black text-[10px]">
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                             النظام جاهز لاستقبال البيانات
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-center space-y-6">
                       <div className="w-20 h-20 bg-white rounded-3xl shadow-sm mx-auto flex items-center justify-center text-blue-600">
                          <RefreshCw size={40} className={isSyncing ? 'animate-spin' : ''} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="font-black text-slate-800">مزامنة البيانات</h4>
                          <p className="text-[10px] font-bold text-slate-400">تحقق من وجود طلبات جديدة من النماذج الخارجية</p>
                       </div>
                       <button 
                         onClick={syncExternalLeads}
                         disabled={isSyncing}
                         className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-500 transition-all disabled:opacity-50"
                       >
                          {isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-right" dir="rtl">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">حفظ قالب جديد</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">تصنيف القالب</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value as AutomationTrigger})}>
                      <option value="OnNewLead">رسالة ترحيب زبون</option>
                      <option value="OnUrgentIssue">بلاغ عطل تقني</option>
                      <option value="OnNewTask">تفاصيل مهمة عمل</option>
                      <option value="OnLowStock">طلب تزويد مخزن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">نص القالب</label>
                    <textarea 
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none h-40 shadow-inner" 
                      placeholder="اكتب النص الذي تريد حفظه هنا..."
                      value={formData.template}
                      onChange={e => setFormData({...formData, template: e.target.value})}
                    />
                  </div>
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">
                 <Save size={18} /> حفظ في القوالب
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationPage;
