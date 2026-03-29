import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  RefreshCw, 
  Trash2,
  Database,
  ArrowRight,
  Code2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleForms = () => {
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'logs'>('setup');

  const webhookUrl = `${window.location.origin}/api/webhooks/external-form`;

  const appsScriptCode = `
function onFormSubmit(e) {
  var url = "${webhookUrl}";
  var responses = e.response.getItemResponses();
  var payload = {};
  
  // استخراج البيانات من النموذج
  for (var i = 0; i < responses.length; i++) {
    var itemResponse = responses[i];
    var title = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();
    payload[title] = response;
  }
  
  // إضافة معلومات إضافية
  payload["source"] = "Google Form";
  payload["timestamp"] = new Date().toISOString();

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());
  } catch (err) {
    Logger.log("Error: " + err.toString());
  }
}

// هذه الدالة تمنع ظهور خطأ "Script function not found: doGet"
function doGet(e) {
  return ContentService.createTextOutput("السكربت يعمل بنجاح. يرجى التأكد من إعداد 'المشغلات' (Triggers) كما هو موضح في التعليمات.");
}
  `.trim();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearLogs = async () => {
    if (!confirm('هل أنت متأكد من مسح سجل العمليات؟')) return;
    try {
      await fetch('/api/webhooks/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <ClipboardList size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">ربط Google Forms</h1>
          </div>
          <p className="text-slate-500 font-bold mr-1">استقبل طلبات الزبائن مباشرة من نماذج جوجل إلى نظامك</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('setup')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'setup' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            إعداد الربط
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            سجل العمليات
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'setup' ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Step 1: Webhook URL */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
              <div className="flex items-center gap-3 text-purple-600">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-black">1</div>
                <h3 className="text-xl font-black">رابط الاستقبال (Webhook URL)</h3>
              </div>
              <p className="text-slate-600 font-bold">قم بنسخ هذا الرابط، ستحتاجه في الخطوة التالية داخل Google Forms:</p>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                <code className="flex-1 font-mono text-sm font-bold text-slate-700 break-all">{webhookUrl}</code>
                <button 
                  onClick={() => copyToClipboard(webhookUrl)}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-purple-600"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* Step 2: Apps Script */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-black">2</div>
                <h3 className="text-xl font-black">إعداد Google Apps Script</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-black text-slate-700 flex items-center gap-2">
                    <Info size={18} className="text-blue-500" /> التعليمات:
                  </h4>
                  <ul className="space-y-3 text-sm font-bold text-slate-500 list-decimal list-inside pr-2">
                    <li>افتح نموذج Google Form الخاص بك.</li>
                    <li>اضغط على النقاط الثلاث (المزيد) ثم اختر <span className="text-blue-600">"محرر النصوص البرمجية" (Script Editor)</span>.</li>
                    <li>امسح أي كود موجود والصق الكود الموضح جهة اليسار.</li>
                    <li>اضغط على أيقونة "الساعة" (Triggers) في القائمة الجانبية.</li>
                    <li>اضغط "إضافة مشغل" (Add Trigger).</li>
                    <li>اختر وظيفة <span className="text-blue-600">onFormSubmit</span>.</li>
                    <li>اختر نوع الحدث: <span className="text-blue-600">"عند إرسال النموذج" (On form submit)</span>.</li>
                    <li>احفظ الإعدادات ووافق على الصلاحيات.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-700 flex items-center gap-2">
                      <Code2 size={18} className="text-blue-500" /> الكود البرمجي:
                    </h4>
                    <button 
                      onClick={() => copyToClipboard(appsScriptCode)}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                    >
                      نسخ الكود بالكامل
                    </button>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl font-mono text-[11px] text-blue-300 overflow-x-auto max-h-[300px] shadow-2xl">
                    <pre>{appsScriptCode}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Mapping Info */}
            <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-200 space-y-4">
              <div className="flex items-center gap-3 text-amber-700">
                <AlertCircle size={24} />
                <h3 className="text-lg font-black">ملاحظة حول أسماء الحقول</h3>
              </div>
              <p className="text-sm font-bold text-amber-800 leading-relaxed">
                لكي يتعرف النظام على البيانات بشكل صحيح، يفضل تسمية الأسئلة في Google Form بأحد هذه الأسماء:
                <br />
                <span className="inline-block mt-2 bg-white px-3 py-1 rounded-lg border border-amber-200 text-xs mr-1">الاسم الكامل</span>
                <span className="inline-block mt-2 bg-white px-3 py-1 rounded-lg border border-amber-200 text-xs mr-1">رقم الهاتف</span>
                <span className="inline-block mt-2 bg-white px-3 py-1 rounded-lg border border-amber-200 text-xs mr-1">الخدمة المطلوبة</span>
                <span className="inline-block mt-2 bg-white px-3 py-1 rounded-lg border border-amber-200 text-xs mr-1">المدينة</span>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">آخر العمليات المستلمة</h3>
              <div className="flex gap-3">
                <button 
                  onClick={fetchLogs}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600"
                  title="تحديث"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={clearLogs}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-red-50 transition-all text-red-500"
                  title="مسح السجل"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الوقت</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">البيانات المستلمة</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">المصدر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-400">
                            <Terminal size={48} strokeWidth={1} />
                            <p className="font-bold">لا توجد عمليات مسجلة بعد</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-all group">
                          <td className="px-8 py-5">
                            <div className="text-xs font-black text-slate-700">{new Date(log.timestamp).toLocaleTimeString('ar-EG')}</div>
                            <div className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleDateString('ar-EG')}</div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                              log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 
                              log.status === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-sm font-bold text-slate-800">{log.payload?.name || '---'}</div>
                            <div className="text-xs text-slate-500">{log.payload?.phone || '---'}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                              <Database size={14} className="text-purple-500" />
                              {log.payload?.source || 'External'}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoogleForms;
