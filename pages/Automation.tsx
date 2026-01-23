
import React, { useState } from 'react';
import { AppState, AutomationRule, AutomationTrigger } from '../types';
import { 
  Zap, Plus, Trash2, MessageCircle, ClipboardCheck, 
  BellRing, ToggleLeft, ToggleRight, LayoutGrid, 
  ShieldCheck, Filter, Target, PlayCircle, 
  Activity, ArrowRight, Save
} from 'lucide-react';

interface AutomationPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const AutomationPage: React.FC<AutomationPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<AutomationRule, 'id'>>({
    trigger: 'OnNewLead',
    action: 'SendWhatsApp',
    template: '',
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: AutomationRule = { ...formData, id: crypto.randomUUID() };
    updateState(prev => ({
      ...prev,
      automationRules: [...(prev.automationRules || []), newRule]
    }));
    setShowForm(false);
    setFormData({ trigger: 'OnNewLead', action: 'SendWhatsApp', template: '', active: true });
  };

  const toggleRule = (id: string) => {
    updateState(prev => ({
      ...prev,
      automationRules: prev.automationRules.map(r => r.id === id ? { ...r, active: !r.active } : r)
    }));
  };

  const deleteRule = (id: string) => {
    if (confirm('حذف هذه القاعدة؟')) {
      updateState(prev => ({
        ...prev,
        automationRules: prev.automationRules.filter(r => r.id !== id)
      }));
    }
  };
  
  const logicSteps = [
    { id: 1, name: 'Validation', desc: 'التحقق من صحة رقم الهاتف المغربي والاسم الكامل للزبون.', icon: <ShieldCheck size={20} /> },
    { id: 2, name: 'Classification', desc: 'تحليل محتوى الرسالة لتصنيفها (صيانة، تركيب، استفسار عام).', icon: <Filter size={20} /> },
    { id: 3, name: 'Priority', desc: 'تحديد درجة الخطورة. الأعطال التقنية تصنف كـ HIGH تلقائياً.', icon: <Target size={20} /> },
    { id: 4, name: 'Decision', desc: 'اتخاذ الإقرار المناسب (إنشاء مهمة عمل أو إرسال رد آلي).', icon: <Zap size={20} /> },
    { id: 5, name: 'Execution', desc: 'تنفيذ الإجراء في النظام وإرسال الرد عبر واتساب أو ميسنجر.', icon: <PlayCircle size={20} /> },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
            <Zap className="text-amber-500 fill-amber-500" /> محرك الأتمتة والقرار (GIM Engine)
          </h2>
          <p className="text-slate-500 font-medium mt-1">المنطق البرمجي الذي يدير شركة Electro GIM تلقائياً 24/7</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all"
        >
          <Plus size={18} /> برمجة قاعدة ذكية
        </button>
      </div>

      {/* Logic Workflow Display */}
      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={150} />
         </div>
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 border-b border-slate-50 pb-4 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> بروتوكول معالجة الطلبات القادمة (Pipeline)
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {logicSteps.map((step, idx) => (
              <div key={step.id} className="relative group">
                 <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform group-hover:bg-blue-600">
                   {step.icon}
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">المرحلة {step.id}</p>
                    <h4 className="font-black text-slate-800 text-base">{step.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{step.desc}</p>
                 </div>
                 {idx < 4 && (
                   <div className="hidden md:block absolute top-7 -right-6 text-slate-200">
                     <ArrowRight size={24} className="opacity-30" />
                   </div>
                 )}
              </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.automationRules?.length > 0 ? state.automationRules.map((rule) => (
          <div key={rule.id} className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 group transition-all hover:shadow-xl ${!rule.active && 'opacity-60 grayscale'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${rule.active ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                {rule.action === 'SendWhatsApp' ? <MessageCircle size={24} /> : rule.action === 'CreateTask' ? <ClipboardCheck size={24} /> : rule.action === 'AutoReply' ? <MessageCircle size={24} /> : <BellRing size={24} />}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRule(rule.id)} className="text-slate-300 hover:text-amber-500 transition-all">
                  {rule.active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
                <button onClick={() => deleteRule(rule.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md mb-2 inline-block">Trigger Event</span>
                <h3 className="font-black text-slate-800 text-sm leading-tight">
                  {rule.trigger}
                </h3>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 underline decoration-blue-500 underline-offset-4">Automated Action: {rule.action}</span>
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic">
                  "{rule.template || 'Default automation logic applied.'}"
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LayoutGrid size={40} className="text-slate-300" />
             </div>
             <p className="text-slate-400 font-black text-xl">لا توجد أتمتة مبرمجة حالياً.</p>
             <button onClick={() => setShowForm(true)} className="text-blue-600 text-sm font-black uppercase tracking-widest mt-4 hover:underline">ابدأ ببرمجة محرك GIM الآن</button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">برمجة رد فعل ذكي</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">AI-Powered System Rule</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900 transition-all">
                <Plus size={32} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">حدث التحفيز (Trigger)</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value as AutomationTrigger})}>
                      <option value="OnNewLead">عند وصول زبون محتمل جديد</option>
                      <option value="OnUrgentIssue">عند اكتشاف عطل عاجل</option>
                      <option value="OnNewTask">عند إنشاء مهمة عمل</option>
                      <option value="OnLowStock">عند نقص في المخزن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">الإجراء المطلوب (Action)</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.action} onChange={e => setFormData({...formData, action: e.target.value as any})}>
                      <option value="AutoReply">رد آلي (AI Response)</option>
                      <option value="SendWhatsApp">رسالة واتساب بزنس</option>
                      <option value="CreateTask">إنشاء مهمة عمل</option>
                      <option value="NotifyAdmin">تنبيه المدير</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">قالب الرسالة / التفاصيل</label>
                    <textarea 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none h-32" 
                      placeholder="أدخل النص هنا..."
                      value={formData.template}
                      onChange={e => setFormData({...formData, template: e.target.value})}
                    />
                  </div>
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                 <Save size={18} /> حفظ وتفعيل القاعدة
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationPage;
