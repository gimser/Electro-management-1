
import React, { useState } from 'react';
import { AppState, CustomerIssue, GIMServiceCategory } from '../types';
import { 
  Bell, Plus, Trash2, Edit2, AlertCircle, 
  CheckCircle2, X, Save, Clock, Tag, MessageSquare, ShieldAlert
} from 'lucide-react';

interface CustomerIssuesPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const CustomerIssuesPage: React.FC<CustomerIssuesPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingIssue, setEditingIssue] = useState<CustomerIssue | null>(null);

  const [formData, setFormData] = useState<Omit<CustomerIssue, 'id' | 'createdAt' | 'comments'>>({
    clientId: '',
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    source: 'Direct',
    category: 'Security & Networks',
    systemAnalysis: '',
    logicSuggestedSolution: '',
    mediaUrls: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert('الرجاء اختيار الزبون أولاً');

    const issueId = editingIssue?.id || crypto.randomUUID();
    
    const newIssue: CustomerIssue = {
      ...formData,
      id: issueId,
      createdAt: editingIssue?.createdAt || new Date().toISOString(),
      comments: editingIssue?.comments || [],
      systemAnalysis: `تم تحليل العطل في قسم ${formData.category} وتصنيفه كأولوية ${formData.priority}`,
      logicSuggestedSolution: editingIssue?.logicSuggestedSolution || 'بانتظار الفحص الميداني الدقيق'
    };

    updateState(prev => ({
      ...prev,
      customerIssues: editingIssue 
        ? prev.customerIssues.map(iss => iss.id === editingIssue.id ? newIssue : iss)
        : [newIssue, ...prev.customerIssues]
    }));
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      clientId: '', title: '', description: '', priority: 'Medium', status: 'Open', 
      source: 'Direct', category: 'Security & Networks', systemAnalysis: '', 
      logicSuggestedSolution: '', mediaUrls: [] 
    });
    setEditingIssue(null);
    setShowForm(false);
  };

  const filteredIssues = state.customerIssues.filter(iss => 
    iss.title.toLowerCase().includes(search.toLowerCase()) || 
    iss.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-slide-up text-right font-arabic pb-40" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Bell className="text-red-500" size={32} /> إدارة بلاغات الأعطال
          </h2>
          <p className="text-slate-500 font-medium">استقبال ومعالجة تذاكر الدعم الفني من الزبناء</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={20} /> فتح تذكرة دعم
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredIssues.length > 0 ? filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full min-h-[300px]">
            <div className={`absolute top-0 right-0 w-2 h-full ${issue.priority === 'High' ? 'bg-red-500' : issue.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
            <div className="flex justify-between items-start mb-6 pl-4">
               <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase border ${issue.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  {issue.status}
               </span>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute left-6 top-8">
                  <button onClick={() => { setEditingIssue(issue); setFormData({...issue}); setShowForm(true); }} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors shadow-sm"><Edit2 size={16}/></button>
                  <button onClick={() => { if(confirm('حذف البلاغ؟')) updateState(prev => ({...prev, customerIssues: prev.customerIssues.filter(i => i.id !== issue.id)}))}} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors shadow-sm"><Trash2 size={16}/></button>
               </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{issue.title}</h3>
            <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-4 leading-relaxed flex-1">{issue.description}</p>
            <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
               <div className="flex items-center gap-2"><Clock size={12}/> {new Date(issue.createdAt).toLocaleDateString()}</div>
               <div className="flex items-center gap-2"><Tag size={12}/> {issue.category}</div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] opacity-30">
             <MessageSquare size={48} className="mx-auto mb-4" />
             <p className="font-black text-xl">لا توجد بلاغات مسجلة حالياً</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col relative">
             
             {/* Modal Header (Fixed) */}
             <div className="p-8 bg-blue-600 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black">{editingIssue ? 'تعديل بيانات التذكرة' : 'فتح تذكرة دعم جديدة'}</h3>
                  <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">GIM-TECH SUPPORT PORTAL</p>
                </div>
                <button onClick={resetForm} className="relative z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all"><X size={24} /></button>
                <ShieldAlert className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12" />
             </div>
             
             {/* Scrollable Form Body */}
             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">اختيار الزبون المتضرر</label>
                      <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                         <option value="">-- اختر الزبون --</option>
                         {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">عنوان المشكلة</label>
                      <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="مثال: عطل في كاميرا المدخل الرئيسي" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الوصف التقني المفصل</label>
                      <textarea required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none h-32 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="اشرح تفاصيل المشكلة..." />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">مستوى الأولوية</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                         <option value="Low">منخفضة</option>
                         <option value="Medium">متوسطة</option>
                         <option value="High">عالية (طارئة)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">فئة الخدمة</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as GIMServiceCategory})}>
                         <option value="Security & Networks">كاميرات وشبكات</option>
                         <option value="Web & Apps">برمجيات ومواقع</option>
                         <option value="Smart Home">منزل ذكي</option>
                         <option value="GIM Store">المتجر</option>
                      </select>
                   </div>
                </div>
                
                {/* Submit Button (At the bottom of form content) */}
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 mt-4">
                   <Save size={20} /> حفظ التذكرة وبدء المعالجة
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerIssuesPage;
