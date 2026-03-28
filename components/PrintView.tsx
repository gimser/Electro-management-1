
import React from 'react';
import { Document, Client, AEIdentity, DocType } from '../types';
import { 
  Printer, ArrowLeft, Building2, MapPin, 
  Phone, Mail, Globe, ShieldCheck, Award, 
  FileText, QrCode
} from 'lucide-react';

interface PrintViewProps {
  document: Document;
  client?: Client;
  settings: AEIdentity;
  onClose: () => void;
}

const PrintView: React.FC<PrintViewProps> = ({ document: doc, client, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // --- Helper Functions for Document Styling ---

  const getDocTitle = (type: DocType) => {
    switch (type) {
      case DocType.FACTURE: return 'فاتورة / FACTURE';
      case DocType.DEVIS: return 'عرض ثمن / DEVIS';
      case DocType.GARANTIE: return 'شهادة ضمان / CERTIFICAT DE GARANTIE';
      case DocType.CONTRAT: return 'عقد صيانة / CONTRAT DE MAINTENANCE';
      case DocType.TICKET: return 'تذكرة بيع / TICKET DE CAISSE';
      case DocType.ACHAT: return 'سند طلب / BON DE COMMANDE';
      default: return 'وثيقة رسمية / DOCUMENT';
    }
  };

  const getDocColor = (type: DocType) => {
    switch (type) {
      case DocType.FACTURE: return 'border-blue-600 text-blue-800';
      case DocType.DEVIS: return 'border-slate-500 text-slate-700';
      case DocType.GARANTIE: return 'border-amber-500 text-amber-700';
      default: return 'border-slate-800 text-slate-900';
    }
  };

  const getLegalText = (type: DocType) => {
    switch (type) {
      case DocType.FACTURE: 
        return "تحتفظ الشركة بملكية البضائع المباعة حتى السداد الكامل للثمن. في حالة النزاع، تختص محكمة الدار البيضاء بالنظر في القضية.";
      case DocType.DEVIS:
        return "هذا العرض صالح لمدة 15 يوماً من تاريخ الإصدار. لبدء العمل، يرجى توقيع الوثيقة وإرجاعها مع تسبيق 50%.";
      case DocType.GARANTIE:
        return "يشمل الضمان عيوب التصنيع فقط. يسقط الضمان في حالة الكسر، السوائل، تذبذب الكهرباء، أو فتح الجهاز من طرف غير مرخص.";
      default:
        return "تخضع هذه الوثيقة للقوانين الجاري بها العمل في المملكة المغربية.";
    }
  };

  // --- Sub-Components ---

  const HeaderSection = () => (
    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-8">
      <div className="space-y-2 text-right">
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{settings.companyName || settings.fullName}</h1>
        <div className="text-[10px] font-bold text-slate-500 space-y-1">
           <p className="flex items-center justify-end gap-2">{settings.address} <MapPin size={12}/></p>
           <p className="flex items-center justify-end gap-2">{settings.phone} <Phone size={12}/></p>
           <p className="flex items-center justify-end gap-2">{settings.email} <Mail size={12}/></p>
        </div>
        <div className="flex justify-end gap-3 mt-3">
           <span className="text-[9px] bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono">ICE: {settings.ice}</span>
           {settings.rc && <span className="text-[9px] bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono">RC: {settings.rc}</span>}
        </div>
      </div>
      
      {/* Dynamic Logo or Placeholder */}
      <div className="flex flex-col items-center">
         {settings.logo ? (
            <img src={settings.logo} alt="Company Logo" className="h-32 w-auto object-contain mb-2" />
         ) : (
            <div className="w-24 h-24 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-2 shadow-lg">
               <Building2 size={40} />
            </div>
         )}
      </div>
    </div>
  );

  const ClientInfoSection = () => (
    <div className="grid grid-cols-2 gap-12 mb-10">
       {/* Doc Info */}
       <div className={`border-l-4 pl-6 ${getDocColor(doc.type)}`}>
          <h2 className="text-xl font-black uppercase mb-1">{getDocTitle(doc.type)}</h2>
          <p className="text-xs font-bold text-slate-400 mb-4">مرجع: <span className="font-mono text-slate-800">{doc.number}</span></p>
          
          <div className="space-y-1 text-xs font-bold">
             <div className="flex justify-between w-48">
                <span className="text-slate-400">تاريخ الإصدار:</span>
                <span>{doc.date}</span>
             </div>
             {doc.dueDate && (
               <div className="flex justify-between w-48">
                  <span className="text-slate-400">تاريخ الاستحقاق:</span>
                  <span className="text-red-500">{doc.dueDate}</span>
               </div>
             )}
          </div>
       </div>

       {/* Client Info */}
       <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">إلى السيد(ة) / الشركة:</p>
          <h3 className="text-lg font-black text-slate-800">{client?.name || 'زبون عام'}</h3>
          <p className="text-xs font-bold text-slate-500 mt-1">{client?.address}</p>
          <p className="text-xs font-bold text-slate-500">{client?.city}</p>
          {client?.ice && <p className="text-[10px] font-mono font-black text-slate-700 mt-2 bg-white px-2 py-1 rounded w-fit inline-block">ICE Client: {client.ice}</p>}
       </div>
    </div>
  );

  // --- Specific Content Renderers ---

  // 1. Invoice / Quote Table
  const renderFinancialTable = () => (
    <div className="mb-8">
       <table className="w-full text-right border-collapse">
          <thead>
             <tr className="bg-slate-900 text-white text-[10px] font-black uppercase">
                <th className="py-4 px-6 text-right rounded-r-xl">الوصف / البيان (Description)</th>
                <th className="py-4 px-4 text-center">الكمية</th>
                <th className="py-4 px-4 text-center">الثمن الوحدوي (P.U. HT)</th>
                <th className="py-4 px-6 text-left rounded-l-xl">المجموع (Total HT)</th>
             </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700">
             {doc.items.map((item, idx) => (
                <tr key={item.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                   <td className="py-4 px-6">
                      <p className="text-slate-900 font-bold text-sm">{item.description}</p>
                      {/* Optional: Add product code/SKU if available in future */}
                   </td>
                   <td className="py-4 px-4 text-center font-mono text-sm">{item.quantity}</td>
                   <td className="py-4 px-4 text-center font-mono">{item.unitPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                   <td className="py-4 px-6 text-left font-mono font-black">{item.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
             ))}
          </tbody>
       </table>

       {/* Totals Section */}
       <div className="flex justify-end mt-6">
          <div className="w-72 space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-500 px-2">
                <span>المجموع الخام (Total HT):</span>
                <span className="font-mono">{doc.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})} DH</span>
             </div>
             <div className="flex justify-between text-xs font-bold text-slate-500 px-2">
                <span>الضريبة (TVA 20%):</span>
                <span className="font-mono">{(doc.tvaAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} DH</span>
             </div>
             <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
                <span className="text-xs font-black uppercase">الصافي للدفع (TTC)</span>
                <span className="text-xl font-black font-mono">{doc.total.toLocaleString('en-US', {minimumFractionDigits: 2})} <span className="text-[10px]">DH</span></span>
             </div>
          </div>
       </div>
    </div>
  );

  // 2. Warranty Certificate Layout
  const renderWarrantyCertificate = () => (
    <div className="mb-12 relative overflow-hidden">
       {/* Background Watermark */}
       <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          {settings.logo ? (
             <img src={settings.logo} className="w-[80%] h-auto grayscale" alt="watermark" />
          ) : (
             <Award size={400} />
          )}
       </div>

       <div className="border-4 border-double border-amber-100 p-8 rounded-[2rem] bg-white relative z-10">
          <div className="flex items-center gap-4 mb-8 bg-amber-50 p-4 rounded-2xl border border-amber-100">
             <ShieldCheck size={32} className="text-amber-600" />
             <div>
                <h3 className="text-lg font-black text-amber-900">التزام بالضمان والجودة</h3>
                <p className="text-xs font-bold text-amber-700">تشهد شركة {settings.companyName} بأن الأجهزة المذكورة أسناه أصلية وخالية من عيوب التصنيع.</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">الجهاز / الخدمة المشمولة</p>
                <div className="text-sm font-bold text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200">
                   {doc.interventionDetails || doc.items.map(i => i.description).join(', ')}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">مدة وتغطية الضمان</p>
                <div className="flex gap-4">
                   <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                      <span className="block text-xs text-slate-400 mb-1">المدة</span>
                      <span className="block text-lg font-black text-slate-800">{doc.warrantyPeriod || '12 شهراً'}</span>
                   </div>
                   <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                      <span className="block text-xs text-slate-400 mb-1">النوع</span>
                      <span className="block text-lg font-black text-slate-800">Pièces & Main</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-2">
             <h4 className="text-xs font-black uppercase text-slate-500">شروط التغطية:</h4>
             <ul className="text-[10px] font-bold text-slate-600 list-disc list-inside leading-relaxed space-y-1 bg-slate-50 p-4 rounded-xl">
                <li>يسري الضمان ابتداءً من تاريخ التسليم: <b>{doc.date}</b>.</li>
                <li>يغطي الضمان عيوب التصنيع والمشاكل التقنية الناتجة عن الاستخدام الطبيعي.</li>
                <li>لا يشمل الضمان الأضرار الناتجة عن سوء الاستخدام، السقوط، تعرض الجهاز للسوائل، أو تقلبات التيار الكهربائي.</li>
                <li>يلغى الضمان تلقائياً في حالة فتح الجهاز أو صيانته خارج ورشاتنا المعتمدة.</li>
             </ul>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-500/50 flex flex-col items-center justify-start p-8 overflow-y-auto print:p-0 print:bg-white print:overflow-visible font-arabic" dir="rtl">
      
      {/* Screen-only Toolbar */}
      <div className="w-[210mm] flex justify-between items-center mb-6 no-print">
        <button onClick={onClose} className="bg-white text-slate-700 px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-slate-100 transition-all shadow-sm">
          <ArrowLeft size={18} /> رجوع
        </button>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Printer size={18} /> طباعة المستند
        </button>
      </div>

      {/* Actual A4 Document */}
      <div 
        className="bg-white shadow-2xl relative flex flex-col print:shadow-none"
        style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '15mm', 
          boxSizing: 'border-box'
        }}
      >
        <HeaderSection />
        <ClientInfoSection />

        {/* Dynamic Content based on Doc Type */}
        <div className="flex-grow">
           {doc.type === DocType.GARANTIE || doc.type === DocType.CONTRAT 
              ? renderWarrantyCertificate() 
              : renderFinancialTable()
           }
           
           {/* Notes Section */}
           {doc.notes && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ملاحظات إضافية:</p>
                 <p className="text-xs font-bold text-slate-700 whitespace-pre-wrap">{doc.notes}</p>
              </div>
           )}
        </div>

        {/* Footer & Legal */}
        <div className="mt-auto pt-8">
           
           {/* Signatures */}
           <div className="grid grid-cols-2 gap-20 mb-8">
              <div className="text-center border-t border-slate-200 pt-4">
                 <p className="text-xs font-black text-slate-400 uppercase mb-8">توقيع وموافقة الزبون</p>
                 <p className="text-[10px] text-slate-300">Lu et approuvé</p>
              </div>
              <div className="text-center border-t border-slate-200 pt-4 relative">
                 <p className="text-xs font-black text-slate-400 uppercase mb-8">توقيع وختم الشركة</p>
                 
                 {/* Real Stamp Image */}
                 {settings.stamp ? (
                    <img src={settings.stamp} alt="Company Stamp" className="absolute top-10 left-1/2 transform -translate-x-1/2 w-40 h-auto opacity-90 rotate-[-3deg]" />
                 ) : (
                    <p className="text-[10px] font-black text-slate-900 mt-10">{settings.companyName}</p>
                 )}
              </div>
           </div>

           {/* Legal Boilerplate */}
           <div className="text-center border-t-2 border-slate-100 pt-4 space-y-2">
              <p className="text-[9px] font-bold text-slate-500 leading-tight px-10">
                 {getLegalText(doc.type)}
              </p>
              <div className="flex justify-center items-center gap-4 text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">
                 <span>RIB: {settings.bankRib}</span>
                 <span>•</span>
                 <span>Patente: {settings.tp}</span>
                 <span>•</span>
                 <span>IF: {settings.if}</span>
              </div>
              <p className="text-[8px] text-slate-300 mt-2">Generated by GIM AE-OS • {new Date().toLocaleString()}</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PrintView;
