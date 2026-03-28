
import React, { useState } from 'react';
import { AppState } from '../types';
import { 
  Share2, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Globe, 
  Key, 
  Save, 
  CheckCircle2, 
  Link2,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SocialMediaSettingsProps {
  settings: AppState['settings'];
  updateSettings: (settings: AppState['settings']) => void;
}

const SocialMediaSettings: React.FC<SocialMediaSettingsProps> = ({ settings, updateSettings }) => {
  const [formData, setFormData] = useState(settings.integrations || {});
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      ...settings,
      integrations: formData
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Share2 className="text-blue-500" size={32} /> إعدادات الربط الاجتماعي
          </h2>
          <p className="text-slate-500 font-medium">ربط نظام Electro GIM بمواقع التواصل لاستقطاب الزبائن تلقائياً</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Save size={20} /> حفظ الإعدادات
        </button>
      </div>

      {isSaved && (
        <div className="mb-8 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
           <CheckCircle2 size={24} className="text-green-500" />
           <p className="font-black text-sm">تم تحديث واجهات الربط الاجتماعي بنجاح!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Facebook Card */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-8 space-y-6 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shadow-inner">
                 <Facebook size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Facebook Business</h3>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Page ID</label>
                 <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1029384756..." value={formData.facebookPageId || ''} onChange={e => setFormData({...formData, facebookPageId: e.target.value})} />
              </div>
              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Access Token</label>
                 <div className="relative">
                    <Key className="absolute left-4 top-3.5 text-slate-300" size={16} />
                    <input type="password" className="w-full pr-5 pl-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.facebookAccessToken || ''} onChange={e => setFormData({...formData, facebookAccessToken: e.target.value})} />
                 </div>
              </div>
           </div>
        </div>

        {/* Instagram Card - المضافة حديثاً */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-8 space-y-6 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="bg-pink-50 p-3 rounded-xl text-pink-600 shadow-inner">
                 <Instagram size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Instagram Pro</h3>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Instagram Business Account ID</label>
                 <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-pink-500 outline-none" placeholder="1784140XXXXXXXX" value={formData.instagramId || ''} onChange={e => setFormData({...formData, instagramId: e.target.value})} />
              </div>
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                 <p className="text-[10px] text-pink-800 font-bold leading-relaxed">
                    يتم استلام الرسائل والتعليقات تلقائياً وتحويلها لطلبات (Leads) عبر واجهة ربط Meta.
                 </p>
              </div>
           </div>
        </div>

        {/* WhatsApp Business */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-8 space-y-6 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600 shadow-inner">
                 <MessageCircle size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">WhatsApp Cloud API</h3>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Phone Number ID</label>
                 <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="112233445566..." value={formData.phoneNumberId || ''} onChange={e => setFormData({...formData, phoneNumberId: e.target.value})} />
              </div>
              <div>
                 <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Permanent Token</label>
                 <div className="relative">
                    <Key className="absolute left-4 top-3.5 text-slate-300" size={16} />
                    <input type="password" className="w-full pr-5 pl-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none" value={formData.accessToken || ''} onChange={e => setFormData({...formData, accessToken: e.target.value})} />
                 </div>
              </div>
           </div>
        </div>

        {/* Company Website Integration */}
        <div className="bg-slate-900 rounded-[3rem] p-10 space-y-8 shadow-2xl lg:col-span-3 text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
           
           <div className="flex items-center gap-4 relative z-10 border-b border-white/10 pb-6">
              <div className="bg-white/10 p-4 rounded-2xl text-blue-400 shadow-inner">
                 <Globe size={28} />
              </div>
              <div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter">GIM Web Integration (Hooks)</h3>
                 <p className="text-blue-300 text-xs font-bold">ربط موقع الشركة لاستقبال الطلبات من الزبائن غير المتعاقدين</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Website URL (Origin)</label>
                 <div className="relative">
                    <Link2 className="absolute left-4 top-4 text-slate-500" size={18} />
                    <input className="w-full pr-5 pl-12 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://electrogim.ma" value={formData.websiteUrl || ''} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Webhook Secret KEY</label>
                 <div className="relative">
                    <ShieldCheck className="absolute left-4 top-4 text-slate-500" size={18} />
                    <input className="w-full pr-5 pl-12 py-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-xs text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.webhookSecret || ''} onChange={e => setFormData({...formData, webhookSecret: e.target.value})} />
                 </div>
              </div>
           </div>

           <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-[2rem] flex items-center gap-4 relative z-10">
              <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
                 <Zap size={20} className="fill-white text-white" />
              </div>
              <p className="text-[11px] font-bold text-blue-100 leading-relaxed">
                 ملاحظة: تأكد من تفعيل خاصية الـ CORS في موقعك للسماح لنظام Electro GIM باستقبال البيانات من دومين الموقع المذكور أعلاه.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSettings;
