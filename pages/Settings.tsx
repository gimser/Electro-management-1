
import React, { useState, useRef } from 'react';
import { CompanySettings } from '../types';
import { Save, Building2, Phone, Mail, FileCheck, Landmark, MapPin, Image, Upload, Trash2 } from 'lucide-react';

interface SettingsPageProps {
  settings: CompanySettings;
  updateSettings: (settings: CompanySettings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, updateSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'stampUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إعدادات النظام</h2>
          <p className="text-slate-500">تخصيص هوية الشركة والوثائق الرسمية</p>
        </div>
        <button 
          onClick={handleSubmit} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <Save size={18} /> حفظ التغييرات
        </button>
      </div>

      {saved && (
        <div className="mb-6 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <FileCheck size={20} /> تم تحديث الإعدادات بنجاح.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Identity & Contact */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-3 mb-4">
              <Building2 size={20} /> الهوية القانونية والمعلومات الضريبية
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">اسم الشركة التجاري</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ICE (المعرف الموحد)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  value={formData.ice}
                  onChange={(e) => setFormData({...formData, ice: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">RC (السجل التجاري)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  value={formData.rc}
                  onChange={(e) => setFormData({...formData, rc: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">IF (التعريف الضريبي)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  value={formData.if}
                  onChange={(e) => setFormData({...formData, if: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">العنوان الكامل</label>
              <textarea 
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-3 mb-4">
              <Landmark size={20} /> المعلومات البنكية
            </div>
            <div>
              <textarea 
                rows={2}
                placeholder="RIB: 000 000 000000000000000000 00"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                value={formData.bankInfo}
                onChange={(e) => setFormData({...formData, bankInfo: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Visual Assets (Stamp & Logo) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-3 mb-4">
              <Upload size={20} /> ختم الشركة الرسمي
            </div>
            <p className="text-xs text-slate-500 mb-4">الختم سيظهر في جميع الوثائق الرسمية أسفل التوقيع.</p>
            
            <div 
              onClick={() => stampInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all min-h-[160px]"
            >
              {formData.stampUrl ? (
                <div className="relative group">
                  <img src={formData.stampUrl} alt="Stamp Preview" className="max-h-32 w-auto object-contain mix-blend-multiply" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                    <p className="text-white text-xs font-bold">تغيير الصورة</p>
                  </div>
                </div>
              ) : (
                <>
                  <Image className="text-slate-300 mb-2" size={40} />
                  <p className="text-sm text-slate-400 font-medium">اضغط لرفع صورة الختم</p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG (بشفافية أفضل)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={stampInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'stampUrl')}
            />
            {formData.stampUrl && (
              <button 
                onClick={() => setFormData({...formData, stampUrl: undefined})}
                className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:bg-red-50 py-2 rounded transition-colors"
              >
                <Trash2 size={14} /> إزالة الختم
              </button>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-3 mb-4">
              <Image size={20} /> شعار الشركة (Logo)
            </div>
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all h-32"
            >
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo Preview" className="max-h-24 w-auto object-contain" />
              ) : (
                <p className="text-sm text-slate-400 font-medium">اضغط لرفع الشعار</p>
              )}
            </div>
            <input 
              type="file" 
              ref={logoInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logoUrl')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
