
import React from 'react';
import { Document, Client, CompanySettings, DocType } from '../types';
import { Printer, ArrowLeft, FileText, Download } from 'lucide-react';

interface PrintViewProps {
  document: Document;
  client?: Client;
  settings: CompanySettings;
  onClose: () => void;
}

const PrintView: React.FC<PrintViewProps> = ({ document: doc, client, settings, onClose }) => {
  const getTitle = () => {
    switch(doc.type) {
      case DocType.DEVIS: return 'عرض ثمن - DEVIS';
      case DocType.FACTURE: return 'فاتورة - FACTURE';
      case DocType.CONTRAT: return 'عقد صيانة - CONTRAT DE MAINTENANCE';
      case DocType.GARANTIE: return 'شهادة ضمان - CERTIFICAT DE GARANTIE';
      case DocType.RAPPORT: return 'تقرير تدخل - RAPPORT D\'INTERVENTION';
      case DocType.RECU: return 'وصل أداء - REÇU DE PAIEMENT';
      default: return 'وثيقة رسمية';
    }
  };

  const handlePrint = () => {
    // تعيين عنوان الصفحة مؤقتاً ليصبح هو اسم ملف الـ PDF عند الحفظ
    const originalTitle = window.document.title;
    const fileName = `${doc.number}_${client?.name || 'Document'}`;
    window.document.title = fileName;
    
    window.print();
    
    // إعادة العنوان الأصلي بعد إغلاق نافذة الطباعة
    setTimeout(() => {
      window.document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-600/20 p-4 sm:p-8 flex flex-col items-center no-print overflow-y-auto">
      {/* Control Bar - Professional Floating Toolbar */}
      <div className="max-w-[210mm] w-full flex justify-between items-center mb-6 no-print bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 sticky top-0 z-50">
        <button 
          onClick={onClose} 
          className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
        >
          <ArrowLeft size={18} /> العودة للنظام
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={handlePrint} 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
          >
            <Printer size={18} /> طباعة ورقية
          </button>
          
          <button 
            onClick={handlePrint} 
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all animate-pulse hover:animate-none"
          >
            <Download size={18} /> استخراج PDF
          </button>
        </div>
      </div>

      {/* The Paper (A4) - Optimized for PDF Generation */}
      <div 
        id="printable-area" 
        className="bg-white shadow-2xl relative flex flex-col print:shadow-none print:border-none text-slate-900 overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '12mm 15mm',
          margin: '0 auto',
          boxSizing: 'border-box',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact'
        }}
      >
        {/* Company Header - Balanced with Legal Info */}
        <div className="flex justify-between items-start border-b-[3px] border-blue-900 pb-6 mb-6">
          <div className="flex gap-6 items-center">
            {settings.logoUrl && (
              <div className="bg-transparent flex items-center justify-center">
                <img 
                  src={settings.logoUrl} 
                  alt="Company Logo" 
                  className="h-24 w-auto object-contain mix-blend-multiply" 
                  style={{ 
                    filter: 'contrast(1.4) brightness(1.05)',
                    maxWidth: '140px'
                  }}
                />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-blue-900 leading-none uppercase tracking-tighter">{settings.name}</h1>
              <div className="text-[10px] font-bold text-slate-700 space-y-0.5 mt-2">
                <p className="flex items-center gap-2"><span className="text-blue-900">Siège:</span> {settings.address}</p>
                <div className="flex gap-4">
                  <p><span className="text-blue-900">Tél:</span> {settings.phone}</p>
                  <p><span className="text-blue-900">Email:</span> {settings.email}</p>
                </div>
                <div className="flex gap-3 text-[9px] bg-slate-50 p-1.5 px-2 rounded border border-slate-200 mt-2">
                  <span className="border-l border-slate-300 pl-3">ICE: <strong>{settings.ice}</strong></span>
                  <span className="border-l border-slate-300 pl-3">RC: <strong>{settings.rc}</strong></span>
                  <span>IF: <strong>{settings.if}</strong></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-left flex flex-col items-end">
            <div className="bg-blue-900 text-white p-3 px-5 rounded-bl-2xl min-w-[210px] shadow-sm">
              <h2 className="text-base font-black text-center uppercase mb-1">{getTitle()}</h2>
              <div className="h-0.5 bg-blue-400/50 w-full mb-2"></div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span className="opacity-75">N° / الرقم:</span>
                  <span className="tracking-widest">{doc.number}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="opacity-75">Date / التاريخ:</span>
                  <span>{doc.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Box */}
        <div className="mb-6 grid grid-cols-2 gap-8">
          <div className="border-r-4 border-blue-900 bg-slate-50/50 p-4 rounded-r-lg shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-blue-900 uppercase mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-900 rounded-full"></div>
              Destinataire / المرسل إليه:
            </h3>
            {client ? (
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900 leading-tight">{client.name}</p>
                <p className="text-[11px] text-slate-600 font-bold">{client.address}, {client.city}</p>
                <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-200 mt-2">
                  <p className="text-[10px] font-bold text-slate-800 uppercase">ICE: <span className="font-mono bg-white px-1 border border-slate-200 rounded">{client.ice}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs">Informations client non disponibles</p>
            )}
          </div>
          
          <div className="flex flex-col justify-center text-left pr-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fait à Casablanca le:</p>
            <p className="text-base font-black text-blue-900">{doc.date}</p>
          </div>
        </div>

        {/* Professional Items Table */}
        <div className="flex-grow">
          {doc.items.length > 0 ? (
            <div className="border-2 border-slate-900 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase">
                    <th className="py-3 px-5 text-right">Désignation des prestations / البيان</th>
                    <th className="py-3 px-4 w-16 text-center border-x border-slate-700">Qté</th>
                    <th className="py-3 px-5 w-28 text-left border-x border-slate-700">P.U (DH)</th>
                    <th className="py-3 px-5 w-32 text-left">Total HT (DH)</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {doc.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                      <td className="py-2.5 px-5 border-b border-slate-200 font-bold text-slate-800">{item.description}</td>
                      <td className="py-2.5 px-4 border-b border-x border-slate-200 text-center font-black font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-5 border-b border-x border-slate-200 text-left font-bold font-mono">{item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-5 border-b border-slate-200 text-left font-black font-mono text-blue-900">{item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {/* Visual padding for pro look */}
                  {Array.from({ length: Math.max(0, 10 - doc.items.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-7">
                      <td className="border-b border-slate-100"></td>
                      <td className="border-b border-x border-slate-100"></td>
                      <td className="border-b border-x border-slate-100"></td>
                      <td className="border-b border-slate-100"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="flex justify-end bg-white">
                <div className="w-72 p-4 space-y-1.5 border-t-2 border-slate-900 bg-slate-50">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>TOTAL HORS TAXE (HT)</span>
                    <span className="font-mono">{doc.subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>TVA APPLICABLE (20%)</span>
                    <span className="font-mono">{(doc.subtotal * 0.2).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-blue-900 border-t-2 border-blue-900 pt-2 mt-2">
                    <span>TOTAL TTC (MAD)</span>
                    <span className="font-mono tracking-tighter">{(doc.subtotal * 1.2).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/30 min-h-[250px]">
              <h4 className="font-black text-[11px] text-blue-900 mb-4 flex items-center gap-2 underline decoration-2 underline-offset-4">
                <FileText size={16} />
                Observations & Détails / ملاحظات وتفاصيل إضافية:
              </h4>
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-bold">
                {doc.notes || '---'}
              </p>
            </div>
          )}
        </div>

        {/* Signature & Payment Section */}
        <div className="mt-8 pt-6 border-t-[2px] border-slate-900 grid grid-cols-2 gap-10 items-end">
          <div className="space-y-4">
            <div className="bg-slate-900 text-white text-[9px] font-black p-1 px-2.5 rounded inline-block uppercase tracking-widest">
              Information de Paiement
            </div>
            <div className="text-[10px] font-bold text-slate-800 bg-blue-50/30 p-3 border border-blue-100 rounded-xl font-mono leading-relaxed shadow-inner">
              {settings.bankInfo}
            </div>
            <p className="text-[9px] text-slate-500 font-black uppercase italic">
              * Arrêté la présente {doc.type.toLowerCase()} à la somme de: 
              <br />
              <span className="text-blue-900 uppercase">--- {(doc.subtotal * 1.2).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Dirhams TTC ---</span>
            </p>
          </div>
          
          <div className="relative text-center min-h-[180px] flex flex-col items-center justify-start border-2 border-slate-100 rounded-2xl bg-slate-50/20 p-3">
            <p className="text-[10px] font-black text-blue-900 mb-2 uppercase tracking-tight underline decoration-2 decoration-blue-900 underline-offset-4">
              Cachet & Signature / الختم والتوقيع
            </p>
            
            {settings.stampUrl && (
              <div className="absolute inset-x-0 bottom-2 flex justify-center items-center pointer-events-none overflow-visible">
                <img 
                  src={settings.stampUrl} 
                  alt="Official Stamp" 
                  className="h-48 w-auto mix-blend-multiply transform -rotate-3" 
                  style={{ 
                    filter: 'contrast(1.5) brightness(1.1) saturate(1.2)',
                    maxWidth: '300px'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Legal Footer Bar */}
        <div className="mt-auto pt-4 text-center border-t border-slate-200">
          <div className="flex justify-center items-center gap-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            <span>RC: {settings.rc}</span>
            <div className="w-1 h-1 bg-blue-900 rounded-full"></div>
            <span>IF: {settings.if}</span>
            <div className="w-1 h-1 bg-blue-900 rounded-full"></div>
            <span>ICE: {settings.ice}</span>
          </div>
          <p className="mt-1 text-[8px] text-blue-900/50 font-bold tracking-widest">ELECTRO GIM SERVICES - MAINTENANCE & TRAVAUX INDUSTRIELS</p>
        </div>
      </div>

      {/* Helper Tooltip for PDF - Only visible on screen */}
      <div className="mt-4 text-white/60 text-xs text-center no-print max-w-[210mm]">
        <p>نصيحة: عند فتح نافذة الطباعة، تأكد من اختيار <strong>"حفظ بتنسيق PDF" (Save as PDF)</strong> من قائمة الطابعات.</p>
      </div>
    </div>
  );
};

export default PrintView;
