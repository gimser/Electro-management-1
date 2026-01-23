
import React, { useState } from 'react';
import { AppState, DocType, Document, LegalNotice } from '../types';
// Fix: Removed non-existent UserShield icon and replaced it with ShieldCheck
import { 
  Scale, ShieldCheck, Archive, FileText, Lock, 
  History, Eye, Download, Search, CheckCircle2,
  AlertTriangle, Gavel, ScrollText,
  FileSignature, HardDriveDownload, Trash2, Edit3,
  ChevronRight, Save
} from 'lucide-react';

interface LegalManagementProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const LegalManagement: React.FC<LegalManagementProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'archive' | 'compliance' | 'contracts'>('archive');
  const [search, setSearch] = useState('');

  const archivedDocs = state.documents.filter(d => d.status === 'Archived' || d.type === DocType.NDA);
  const filteredArchive = archivedDocs.filter(d => d.number.includes(search));

  const legalConfigs = state.settings.legal || {
    privacyPolicy: "سياسة الخصوصية لشركة Electro GIM تلتزم بحماية بيانات الزبائن وفق القانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي...",
    termsOfService: "شروط استخدام خدماتنا تنص على أن كل تدخل تقني يخضع لضمان مدته 3 أشهر من تاريخ الفاتورة...",
    warrantyTerms: "الضمان يشمل عيوب التركيب ولا يشمل سوء الاستخدام أو الكوارث الطبيعية..."
  };

  const handleArchive = (docId: string) => {
    if (confirm('أرشفة هذه الوثيقة تمنع أي تعديل مستقبلي عليها لأسباب قانونية. هل أنت متأكد؟')) {
       updateState(prev => ({
          ...prev,
          documents: prev.documents.map(d => d.id === docId ? { ...d, status: 'Archived' } : d),
          activityLogs: [{
             id: crypto.randomUUID(),
             userId: 'admin',
             username: 'admin',
             action: 'ARCHIVE_DOC',
             module: 'LEGAL',
             timestamp: new Date().toISOString(),
             details: `تمت أرشفة الوثيقة رقم ${state.documents.find(dx => dx.id === docId)?.number}`,
             severity: 'Info'
          }, ...(prev.activityLogs || [])]
       }));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      
      {/* Hero Section */}
      <div className="flex justify-between items-center bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
         <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
               <Scale size={40} className="text-white" />
            </div>
            <div>
               <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">مركز الإدارة القانونية والامتثال</h2>
               <p className="text-slate-400 font-bold">تأمين وثائق الشركة، إدارة سياسات الخصوصية، والتدقيق الأمني الشامل.</p>
            </div>
         </div>
         <div className="relative z-10 hidden md:block">
            <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
               <ShieldCheck size={20} className="text-green-400" />
               <span className="text-xs font-black uppercase tracking-widest">النظام ممتثل للقانون 09-08</span>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(217,119,6,0.1),transparent)] pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         
         {/* Navigation Sidebar */}
         <div className="lg:col-span-1 space-y-4">
            {[
               { id: 'archive', label: 'الأرشيف القانوني', icon: <Archive size={18} /> },
               { id: 'compliance', label: 'الخصوصية والشروط', icon: <ShieldCheck size={18} /> },
               { id: 'contracts', label: 'قوالب العقود وNDA', icon: <FileSignature size={18} /> },
            ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] font-black text-sm transition-all border ${
                     activeTab === tab.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-amber-200'
                  }`}
               >
                  <div className="flex items-center gap-4">
                     {tab.icon}
                     <span>{tab.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === tab.id ? '' : 'text-slate-300'} />
               </button>
            ))}

            <div className="pt-8 border-t border-slate-100">
               <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700">
                     <AlertTriangle size={18} />
                     <h4 className="text-xs font-black uppercase">تنبيه قانوني</h4>
                  </div>
                  <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic">
                     "يجب الاحتفاظ بالفواتير الأصلية لمدة 10 سنوات على الأقل وفقاً للمدونة العامة للضرائب المغربية."
                  </p>
               </div>
            </div>
         </div>

         {/* Main Workspace */}
         <div className="lg:col-span-3">
            
            {activeTab === 'archive' && (
               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-left-4">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <History className="text-slate-400" />
                        <h3 className="text-lg font-black text-slate-800">الأرشيف غير القابل للتعديل</h3>
                     </div>
                     <div className="relative">
                        <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
                        <input 
                           className="bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none w-64" 
                           placeholder="البحث في الأرشيف..." 
                           value={search}
                           onChange={e => setSearch(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-right">
                        <thead>
                           <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">نوع الوثيقة</th>
                              <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">رقم المرجع</th>
                              <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">تاريخ الأرشفة</th>
                              <th className="px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">الربط القانوني</th>
                              <th className="px-8 py-4 text-left">الإجراءات</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {filteredArchive.length > 0 ? filteredArchive.map(doc => (
                              <tr key={doc.id} className="hover:bg-slate-50/80 transition-all">
                                 <td className="px-8 py-5">
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border border-slate-200 uppercase">{doc.type}</span>
                                 </td>
                                 <td className="px-8 py-5 font-black text-slate-800 text-sm font-mono">{doc.number}</td>
                                 <td className="px-8 py-5 text-center text-[10px] font-bold text-slate-500">{doc.date}</td>
                                 <td className="px-8 py-5 text-center">
                                    <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 text-[9px] font-black uppercase">
                                       <Lock size={10} /> مؤرشف نهائياً
                                    </div>
                                 </td>
                                 <td className="px-8 py-5 text-left">
                                    <div className="flex items-center justify-end gap-2">
                                       <button className="p-2 text-slate-400 hover:text-blue-600 transition-all shadow-sm rounded-lg border border-slate-100"><Eye size={16}/></button>
                                       <button className="p-2 text-slate-400 hover:text-blue-600 transition-all shadow-sm rounded-lg border border-slate-100"><Download size={16}/></button>
                                    </div>
                                 </td>
                              </tr>
                           )) : (
                              <tr>
                                 <td colSpan={5} className="py-20 text-center opacity-20">
                                    <Archive size={48} className="mx-auto mb-2" />
                                    <p className="font-black text-sm uppercase">الأرشيف فارغ حالياً</p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'compliance' && (
               <div className="space-y-6 animate-in slide-in-from-left-4">
                  <div className="bg-white rounded-[3rem] border border-slate-200 p-10 space-y-8">
                     <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <Gavel className="text-amber-600" />
                        <h3 className="text-lg font-black text-slate-800">سياسة الخصوصية وشروط الاستخدام</h3>
                     </div>
                     
                     <div className="space-y-8">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">سياسة حماية البيانات (CNDP)</label>
                           <textarea 
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold leading-relaxed resize-none h-40 focus:ring-2 focus:ring-amber-500 outline-none"
                              value={legalConfigs.privacyPolicy}
                              readOnly
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">شروط الخدمة للزبائن</label>
                           <textarea 
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold leading-relaxed resize-none h-40 focus:ring-2 focus:ring-amber-500 outline-none"
                              value={legalConfigs.termsOfService}
                              readOnly
                           />
                        </div>
                     </div>

                     <div className="flex justify-end pt-6 border-t border-slate-50">
                        <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all flex items-center gap-3">
                           <Save size={18} /> تحديث السياسات القانونية
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'contracts' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4">
                  {[
                     { title: 'عقد صيانة سنوي', desc: 'نموذج عقد صيانة للمؤسسات والشركات.', icon: <ScrollText className="text-blue-500" /> },
                     { title: 'اتفاقية NDA للتقنيين', desc: 'حماية أسرار الشركة وقاعدة بيانات الزبناء.', icon: <ShieldCheck className="text-green-500" /> },
                     { title: 'شهادة ضمان (Garantie)', desc: 'وثيقة قانونية تضمن جودة الإصلاح.', icon: <CheckCircle2 className="text-amber-500" /> },
                     { title: 'إخلاء مسؤولية تقني', desc: 'يوقعها الزبون عند التدخل في أجهزة خارج الضمان.', icon: <AlertTriangle className="text-red-500" /> },
                  ].map((contract, idx) => (
                     <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div className="bg-slate-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                              {contract.icon}
                           </div>
                           <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded uppercase">GIM-TMP-V2</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-2">{contract.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">{contract.desc}</p>
                        <div className="flex gap-2">
                           <button className="flex-1 bg-slate-900 text-white font-black py-3 rounded-2xl text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">توليد مسودة</button>
                           <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-800 transition-all"><Edit3 size={18}/></button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

         </div>
      </div>

      {/* Persistent Operations Log Footer */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
         <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-8">
            <History size={24} className="text-amber-400" />
            <h3 className="text-xl font-black uppercase tracking-tighter">سجل الرقابة القانونية (Audit Trail)</h3>
         </div>
         <div className="space-y-4 max-h-40 overflow-y-auto custom-scrollbar pr-4">
            {(state.activityLogs || []).filter(l => l.module === 'LEGAL' || l.severity === 'Critical').map(log => (
               <div key={log.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center text-right" dir="rtl">
                  <div className="flex items-center gap-4">
                     <span className={`w-2 h-2 rounded-full ${log.severity === 'Critical' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                     <p className="text-xs font-bold">{log.details}</p>
                  </div>
                  <div className="text-left">
                     <p className="text-[8px] font-black text-slate-500 uppercase">{log.timestamp}</p>
                     <p className="text-[9px] font-black text-amber-500">USER: {log.username}</p>
                  </div>
               </div>
            ))}
            {state.activityLogs.filter(l => l.module === 'LEGAL').length === 0 && <p className="text-center text-slate-500 py-10 italic text-sm">لا توجد سجلات تدقيق حرجة حالياً</p>}
         </div>
      </div>
    </div>
  );
};

export default LegalManagement;
