
import React, { useState, useRef } from 'react';
import { CompanySettings, AppState, WorkingDay } from '../types';
// Added RefreshCw to the imports from lucide-react
import { 
  Save, Building2, ShieldCheck, Zap, ToggleRight, ToggleLeft, 
  Activity, Globe, Phone, Mail, Landmark, Image as ImageIcon, 
  Clock, Bell, LayoutGrid, Key, Link2, Languages, Coins, 
  ChevronRight, Laptop, UserCog, Database, Terminal, Upload, X, Trash2,
  RefreshCw
} from 'lucide-react';

interface SettingsPageProps {
  settings: CompanySettings;
  updateSettings: (settings: CompanySettings) => void;
  state: AppState;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, updateSettings, state }) => {
  const [activeSubTab, setActiveSubTab] = useState<'company' | 'operation' | 'system' | 'api'>('company');
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'stampUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, [field]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'logoUrl' | 'stampUrl') => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleAiFeature = (feature: keyof CompanySettings['aiFeaturesEnabled']) => {
    setFormData(prev => ({
      ...prev,
      aiFeaturesEnabled: {
        ...prev.aiFeaturesEnabled,
        [feature]: !prev.aiFeaturesEnabled[feature]
      }
    }));
  };

  const toggleNotification = (key: keyof CompanySettings['notifications']) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const updateWorkingDay = (index: number, updates: Partial<WorkingDay>) => {
    const newHours = [...formData.workingHours];
    newHours[index] = { ...newHours[index], ...updates };
    setFormData({ ...formData, workingHours: newHours });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      
      {/* Dynamic Header */}
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                 <LayoutGrid size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Command Center</h2>
           </div>
           <p className="text-slate-500 font-bold mr-14">إدارة نواة نظام Electro GIM والتحكم في الهوية التشغيلية للمؤسسة.</p>
        </div>
        <div className="flex gap-4">
           {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-2xl font-black flex items-center gap-3 animate-bounce">
                 <ShieldCheck size={20} /> تم التحديث!
              </div>
           )}
           <button onClick={() => handleSubmit()} className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
              <Save size={20} /> حفظ التغييرات الاستراتيجية
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Unified Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
           {[
             { id: 'company', label: 'هوية الشركة والوثائق', icon: <Building2 size={18} /> },
             { id: 'operation', label: 'ساعات العمل والعملة', icon: <Clock size={18} /> },
             { id: 'system', label: 'النظام والإشعارات', icon: <Bell size={18} /> },
             { id: 'api', label: 'الربط البرمجي وWebhooks', icon: <Terminal size={18} /> },
           ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] font-black text-sm transition-all border ${
                   activeSubTab === tab.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'
                }`}
             >
                <div className="flex items-center gap-4">
                   {tab.icon}
                   <span>{tab.label}</span>
                </div>
                <ChevronRight size={16} className={`${activeSubTab === tab.id ? 'opacity-100' : 'opacity-0'} -rotate-180`} />
             </button>
           ))}

           <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Database size={14} /> حالة قاعدة البيانات
              </h4>
              <div className="space-y-3">
                 <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>حجم البيانات</span>
                    <span className="font-mono">1.2 MB</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/4"></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Workspace */}
        <div className="lg:col-span-3 space-y-10 animate-in slide-in-from-left-6 duration-500">
           
           {activeSubTab === 'company' && (
              <div className="space-y-10">
                 {/* Visual Identity Section - Updated with File Import */}
                 <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-8 border-4 border-slate-800">
                    <div className="flex justify-between items-center border-b border-white/10 pb-5">
                       <h3 className="text-xl font-black flex items-center gap-3">
                          <ImageIcon className="text-blue-400" /> الهوية البصرية الرسمية
                       </h3>
                       <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">Import from Device</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {/* Logo Upload Card */}
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mr-2">شعار الشركة (Company Logo)</label>
                          <div 
                             onClick={() => logoInputRef.current?.click()}
                             className="group relative h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-white/10 transition-all overflow-hidden"
                          >
                             {formData.logoUrl ? (
                                <>
                                   <img src={formData.logoUrl} className="max-h-32 object-contain mix-blend-lighten p-4" alt="Preview Logo" />
                                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <RefreshCw size={24} className="text-white" />
                                   </div>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); removeImage('logoUrl'); }}
                                      className="absolute top-4 left-4 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                   >
                                      <Trash2 size={14} />
                                   </button>
                                </>
                             ) : (
                                <>
                                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                      <Upload size={24} className="text-blue-400" />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase">اضغط لرفع الشعار</p>
                                   <p className="text-[8px] text-slate-500 mt-1">PNG, JPG (Max 2MB)</p>
                                </>
                             )}
                             <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')} />
                          </div>
                       </div>

                       {/* Stamp Upload Card */}
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mr-2">الختم والتوقيع (Official Stamp)</label>
                          <div 
                             onClick={() => stampInputRef.current?.click()}
                             className="group relative h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-white/10 transition-all overflow-hidden"
                          >
                             {formData.stampUrl ? (
                                <>
                                   <img src={formData.stampUrl} className="max-h-32 object-contain mix-blend-multiply bg-white/80 rounded-2xl p-4" alt="Preview Stamp" />
                                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <RefreshCw size={24} className="text-white" />
                                   </div>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); removeImage('stampUrl'); }}
                                      className="absolute top-4 left-4 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                   >
                                      <Trash2 size={14} />
                                   </button>
                                </>
                             ) : (
                                <>
                                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                      <ShieldCheck size={24} className="text-amber-400" />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase">اضغط لرفع الختم</p>
                                   <p className="text-[8px] text-slate-500 mt-1">يفضل أن يكون بخلفية شفافة</p>
                                </>
                             )}
                             <input type="file" ref={stampInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'stampUrl')} />
                          </div>
                       </div>
                    </div>

                    <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] flex items-center gap-4">
                       <Zap size={20} className="text-blue-400 shrink-0" />
                       <p className="text-[10px] font-bold text-blue-200 leading-relaxed italic">
                          يتم دمج هذه الأصول تلقائياً في قوالب الطباعة (الفواتير، عروض الأثمان، وشهادات الضمان) لضمان هوية احترافية موحدة.
                       </p>
                    </div>
                 </div>

                 <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 border-b border-slate-50 pb-5">
                       <Landmark className="text-blue-600" /> المعلومات الرسمية والمالية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">الاسم التجاري الكامل</label>
                          <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">العنوان الفعلي (المقر الاجتماعي)</label>
                          <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">الرقم الضريبي (IF)</label>
                          <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono" value={formData.if} onChange={e => setFormData({...formData, if: e.target.value})} />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">المعرف الموحد (ICE)</label>
                          <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-blue-600 font-black" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} />
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">معلومات الحساب البنكي (RIB)</label>
                          <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold resize-none" rows={2} value={formData.bankInfo} onChange={e => setFormData({...formData, bankInfo: e.target.value})} />
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeSubTab === 'operation' && (
              <div className="space-y-10">
                 <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 border-b border-slate-50 pb-5">
                       <Clock className="text-amber-600" /> توقيت العمل الرسمي للمؤسسة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {formData.workingHours.map((wh, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                             <div className="flex items-center gap-4">
                                <button 
                                   onClick={() => updateWorkingDay(idx, { isClosed: !wh.isClosed })}
                                   className={`w-6 h-6 rounded-full border-2 transition-all ${wh.isClosed ? 'border-red-400 bg-red-400' : 'border-blue-500'}`}
                                />
                                <span className="font-black text-slate-800 text-sm">{wh.day}</span>
                             </div>
                             {!wh.isClosed ? (
                                <div className="flex items-center gap-2">
                                   <input type="time" className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-black text-[10px]" value={wh.open} onChange={e => updateWorkingDay(idx, { open: e.target.value })} />
                                   <span className="text-slate-400 font-bold">إلى</span>
                                   <input type="time" className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-black text-[10px]" value={wh.close} onChange={e => updateWorkingDay(idx, { close: e.target.value })} />
                                </div>
                             ) : (
                                <span className="text-red-500 font-black text-[10px] uppercase">مغلق (عطلة)</span>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 border-b border-slate-50 pb-5">
                       <Languages className="text-blue-600" /> الإعدادات الإقليمية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Languages size={14}/> لغة الواجهة الرئيسية</label>
                          <div className="flex gap-2">
                             {['ar', 'fr'].map(lang => (
                                <button 
                                   key={lang}
                                   onClick={() => setFormData({...formData, language: lang as any})}
                                   className={`flex-1 py-4 rounded-2xl font-black text-xs border transition-all ${formData.language === lang ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 text-slate-500'}`}
                                >
                                   {lang === 'ar' ? 'العربية' : 'Français'}
                                </button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Coins size={14}/> عملة النظام</label>
                          <div className="flex gap-2">
                             {['MAD', 'USD', 'EUR'].map(curr => (
                                <button 
                                   key={curr}
                                   onClick={() => setFormData({...formData, currency: curr as any})}
                                   className={`flex-1 py-4 rounded-2xl font-black text-xs border transition-all ${formData.currency === curr ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-500'}`}
                                >
                                   {curr}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeSubTab === 'system' && (
              <div className="space-y-10">
                 <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 border-b border-slate-50 pb-5">
                       <Bell className="text-blue-600" /> نظام الإشعارات والتنبيهات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                          { key: 'email', label: 'تنبيهات البريد الإلكتروني', desc: 'إرسال تقارير يومية للمدير.' },
                          { key: 'whatsapp', label: 'رسائل واتساب بزنس', desc: 'تفعيل التواصل الآلي مع الزبناء.' },
                          { key: 'system', label: 'إشعارات المتصفح (Push)', desc: 'تنبيهات فورية عند وصول طلبات.' },
                          { key: 'lowStockAlert', label: 'تنبيهات المخزون الحرج', desc: 'تحذير عند نقص قطع الغيار.' },
                          { key: 'newLeadAlert', label: 'تنبيه الفرص الجديدة', desc: 'إخطار فريق المبيعات بالزبائن المحتملين.' },
                          { key: 'paymentReminder', label: 'تذكير بالديون العالقة', desc: 'جدولة تذكيرات آلية للفواتير المتأخرة.' },
                       ].map(notif => (
                          <div key={notif.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                             <div>
                                <p className="text-sm font-black text-slate-800">{notif.label}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{notif.desc}</p>
                             </div>
                             <button onClick={() => toggleNotification(notif.key as any)}>
                                {formData.notifications[notif.key as keyof typeof formData.notifications] ? <ToggleRight size={40} className="text-blue-600" /> : <ToggleLeft size={40} className="text-slate-300" />}
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl border-4 border-slate-800 space-y-8 relative overflow-hidden">
                    <h3 className="text-xl font-black flex items-center gap-3 border-b border-white/10 pb-5">
                       <Zap className="text-blue-400 fill-blue-400" /> محرك الأتمتة والذكاء (GIM-AI)
                    </h3>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                          <div>
                             <p className="text-sm font-black">مستوى التدخل الآلي (Automation Level)</p>
                             <p className="text-xs text-slate-400">تحديد مدى حرية المحرك في اتخاذ القرارات.</p>
                          </div>
                          <div className="text-left">
                             <span className="text-2xl font-black text-blue-400">{formData.aiAutomationLevel}%</span>
                          </div>
                       </div>
                       <input type="range" min="0" max="100" className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" value={formData.aiAutomationLevel} onChange={e => setFormData({...formData, aiAutomationLevel: parseInt(e.target.value)})} />
                    </div>
                 </div>
              </div>
           )}

           {activeSubTab === 'api' && (
              <div className="space-y-10">
                 <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl border-4 border-slate-800 space-y-8">
                    <div className="flex justify-between items-start border-b border-white/10 pb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-400/30">
                             <Key size={28} />
                          </div>
                          <div>
                             <h3 className="text-2xl font-black uppercase tracking-tighter">API Infrastructure</h3>
                             <p className="text-blue-300 text-xs font-bold">ربط النظام بتطبيقات خارجية وأنظمة طرف ثالث</p>
                          </div>
                       </div>
                       <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">توليد مفتاح جديد</button>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">GIM-SYSTEM-KEY (Private)</label>
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl font-mono text-blue-400 text-xs flex justify-between items-center group">
                             <span>{formData.integrations.apiKey}</span>
                             <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 p-2 rounded-lg"><Activity size={14}/></button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">GIM-WEBHOOK (Endpoint)</label>
                             <div className="relative">
                                <Link2 className="absolute right-4 top-4 text-slate-500" size={18} />
                                <input className="w-full pr-12 pl-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-[10px] text-slate-300" value={formData.integrations.externalEndpoint} onChange={e => setFormData({...formData, integrations: {...formData.integrations, externalEndpoint: e.target.value}})} />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Webhook Secret</label>
                             <div className="relative">
                                <ShieldCheck className="absolute right-4 top-4 text-slate-500" size={18} />
                                <input type="password" className="w-full pr-12 pl-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-[10px] text-slate-300" value={formData.integrations.webhookSecret} onChange={e => setFormData({...formData, integrations: {...formData.integrations, webhookSecret: e.target.value}})} />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] space-y-4">
                       <h4 className="text-sm font-black text-blue-400 flex items-center gap-2"><Laptop size={16}/> بروتوكول التوثيق للمطورين</h4>
                       <p className="text-xs text-blue-200 leading-relaxed font-bold">
                          لإرسال بيانات من نظام خارجي إلى Electro GIM، استخدم ترويسة (Header) من نوع <span className="bg-white/10 px-2 py-0.5 rounded font-mono text-white">X-GIM-KEY</span> تحتوي على المفتاح الخاص بك. سيتم تجاهل أي طلب غير موثق آلياً.
                       </p>
                    </div>
                 </div>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
