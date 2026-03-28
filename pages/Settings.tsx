
import React, { useState } from 'react';
import { AEIdentity } from '../types';
import { Save, ShieldCheck, User, Fingerprint, MapPin, Phone, Mail, Landmark, CreditCard, Scale, Building2, FileText, Image as ImageIcon, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { resetDB } from '../db';

interface SettingsPageProps {
  settings: AEIdentity;
  updateSettings: (settings: AEIdentity) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, updateSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'stamp') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'logo' | 'stamp') => {
    setFormData({ ...formData, [field]: undefined });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 text-right animate-in fade-in pb-20" dir="rtl">
      <div className="flex justify-between items-center border-b border-slate-200 pb-8">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
              <Building2 className="text-blue-600" size={32} /> الهوية القانونية والبصرية
           </h2>
           <p className="text-slate-500 font-bold">إعدادات البيانات والشعارات التي تظهر في الفواتير والوثائق الرسمية (SARL)</p>
        </div>
        {saved && (
           <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-2xl font-black flex items-center gap-3 animate-bounce shadow-sm">
              <ShieldCheck size={20} /> تم تحديث بيانات الشركة!
           </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-12 space-y-12">
         
         {/* Visual Identity Section */}
         <div className="space-y-6">
            <h3 className="text-lg font-black text-blue-900 border-b border-blue-50 pb-2 flex items-center gap-2">
               <ImageIcon size={20} /> الهوية البصرية (Visual Identity)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Logo Upload */}
               <div className="space-y-4">
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">شعار الشركة (Logo)</label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 rounded-3xl h-48 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all overflow-hidden">
                     {formData.logo ? (
                        <>
                           <img src={formData.logo} alt="Logo" className="h-full w-full object-contain p-4" />
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => removeImage('logo')} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs">حذف الشعار</button>
                           </div>
                        </>
                     ) : (
                        <div className="text-center p-6">
                           <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                           <p className="text-slate-500 font-bold text-xs">اضغط لرفع الشعار</p>
                           <p className="text-[10px] text-slate-400 mt-1">PNG, JPG (Max 2MB)</p>
                        </div>
                     )}
                     <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} />
                  </div>
               </div>

               {/* Stamp Upload */}
               <div className="space-y-4">
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">الختم الرسمي (Cachet & Signature)</label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 rounded-3xl h-48 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all overflow-hidden">
                     {formData.stamp ? (
                        <>
                           <img src={formData.stamp} alt="Stamp" className="h-full w-full object-contain p-4 opacity-90 rotate-[-5deg]" />
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => removeImage('stamp')} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs">حذف الختم</button>
                           </div>
                        </>
                     ) : (
                        <div className="text-center p-6">
                           <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                           <p className="text-slate-500 font-bold text-xs">اضغط لرفع صورة الختم</p>
                           <p className="text-[10px] text-slate-400 mt-1">يستحسن صورة بخلفية شفافة (PNG)</p>
                        </div>
                     )}
                     <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'stamp')} />
                  </div>
               </div>
            </div>
         </div>

         {/* General Info */}
         <div className="space-y-6">
            <h3 className="text-lg font-black text-blue-900 border-b border-blue-50 pb-2">1. المعلومات العامة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><Building2 size={14} className="text-blue-500"/> اسم الشركة (Raison Sociale)</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="مثال: GIM SERVICES SARL" />
               </div>
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><MapPin size={14} className="text-blue-500"/> المقر الاجتماعي (Siège Social)</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
               </div>
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><Phone size={14} className="text-blue-500"/> الهاتف الرسمي</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-left" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><Mail size={14} className="text-blue-500"/> البريد الإلكتروني</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
            </div>
         </div>

         {/* Legal Info */}
         <div className="space-y-6">
            <h3 className="text-lg font-black text-blue-900 border-b border-blue-50 pb-2">2. المعرفات القانونية والجبائية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><Landmark size={14} className="text-blue-500"/> المعرف الموحد (ICE)</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} />
               </div>
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><FileText size={14} className="text-blue-500"/> السجل التجاري (RC)</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.rc || ''} onChange={e => setFormData({...formData, rc: e.target.value})} placeholder="رقم السجل والمدينة" />
               </div>
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><Scale size={14} className="text-blue-500"/> المعرف الجبائي (IF)</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.if || ''} onChange={e => setFormData({...formData, if: e.target.value})} />
               </div>
               <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><ShieldCheck size={14} className="text-blue-500"/> الضريبة المهنية (Patente)</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tp || ''} onChange={e => setFormData({...formData, tp: e.target.value})} />
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-lg font-black text-blue-900 border-b border-blue-50 pb-2">3. البيانات البنكية</h3>
            <div className="space-y-4">
               <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mr-2"><CreditCard size={14} className="text-blue-500"/> الحساب البنكي (RIB - 24 Digits)</label>
               <input required className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-lg font-black focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-slate-800" value={formData.bankRib} onChange={e => setFormData({...formData, bankRib: e.target.value})} />
            </div>
         </div>

         <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-4 border-r-8 border-blue-500">
            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} className="text-blue-400" /> مسؤولية الإدارة</h4>
            <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
               بصفتك مسير الشركة، أنت تصرح بأن جميع المعلومات القانونية والشعارات المرفقة أعلاه صحيحة ومطابقة للسجل التجاري. سيتم استخدام هذه البيانات لإصدار الفواتير القانونية المتوافقة مع قوانين المديرية العامة للضرائب.
            </p>
         </div>

         <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
            <Save size={20} /> تحديث السجل القانوني والهوية
         </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-[3rem] border border-red-200 p-12 space-y-6">
         <div className="flex items-center gap-4 text-red-700">
            <AlertTriangle size={32} />
            <div>
               <h3 className="text-xl font-black uppercase tracking-tighter">منطقة الخطر (Danger Zone)</h3>
               <p className="text-xs font-bold opacity-70">هذه العمليات لا يمكن التراجع عنها. المرجو الحذر الشديد.</p>
            </div>
         </div>

         <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 p-6 rounded-2xl border border-red-100">
            <div className="text-right">
               <h4 className="font-black text-slate-800">إعادة ضبط المصنع (Factory Reset)</h4>
               <p className="text-[10px] font-bold text-slate-500">سيتم مسح جميع البيانات، الزبناء، الفواتير، والملفات بشكل نهائي من المتصفح.</p>
            </div>
            <button 
                type="button"
                onClick={() => setShowResetModal(true)}
                className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200"
            >
               <Trash2 size={18} /> مسح جميع بيانات النظام
            </button>
         </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-center p-10 space-y-6">
               <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <AlertTriangle size={40} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter">هل أنت متأكد تماماً؟</h3>
                  <p className="text-slate-500 font-bold mt-2 leading-relaxed">
                     سيتم حذف جميع البيانات (الزبناء، الفواتير، المهام، والملفات) بشكل نهائي. لا يمكن استرجاع هذه البيانات بعد الحذف.
                  </p>
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                     onClick={() => {
                        resetDB();
                        setShowResetModal(false);
                     }}
                     className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-red-700 transition-all"
                  >
                     نعم، احذف كل شيء
                  </button>
                  <button 
                     onClick={() => setShowResetModal(false)}
                     className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all"
                  >
                     إلغاء العملية
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default SettingsPage;
