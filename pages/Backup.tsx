
import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { saveDB, getVersions, rollbackToVersion, DBVersion } from '../db';
import { 
  Database, Download, Upload, Trash2, 
  ShieldCheck, AlertTriangle, FileJson, 
  History, CheckCircle2, RefreshCw, X,
  Clock, Zap, RotateCcw, Box, HardDrive
} from 'lucide-react';

interface BackupPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const BackupPage: React.FC<BackupPageProps> = ({ state, updateState }) => {
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState<string | null>(null);
  const [formatCode, setFormatCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [snapshots, setSnapshots] = useState<DBVersion[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastAction, setLastAction] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshSnapshots();
  }, []);

  const refreshSnapshots = async () => {
    setIsLoadingHistory(true);
    try {
        const versions = await getVersions();
        setSnapshots(versions);
    } catch (e) {
        console.error("Failed to load versions", e);
    } finally {
        setIsLoadingHistory(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `GIM_AE_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setLastAction({ type: 'success', msg: 'تم تصدير نسخة احتياطية كاملة بنجاح.' });
    setTimeout(() => setLastAction(null), 4000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (importedData.identity && importedData.clients) {
          if (confirm('⚠️ تحذير: استيراد البيانات سيقوم باستبدال كافة البيانات الحالية. هل أنت متأكد؟')) {
            // Save imported data to IDB
            await saveDB(importedData, 'Manual Import', 'Manual');
            updateState(() => importedData);
            setLastAction({ type: 'success', msg: 'تمت استعادة البيانات وتحديث النظام بالكامل.' });
            refreshSnapshots();
          }
        } else {
          throw new Error('ملف غير صالح');
        }
      } catch (err) {
        setLastAction({ type: 'error', msg: 'خطأ: الملف المرفوع ليس نسخة احتياطية صالحة من GIM AE-OS.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRollback = async (versionId: string) => {
    try {
      // First, snapshot current state just in case
      await saveDB(state, 'Pre-Rollback Backup', 'Manual');
      
      const restoredState = await rollbackToVersion(versionId);
      if (restoredState) {
          await saveDB(restoredState, `Restored from ${versionId.substring(0,8)}`, 'Manual');
          updateState(() => restoredState);
          setLastAction({ type: 'success', msg: 'تم استرجاع النظام لنقطة الاستعادة بنجاح.' });
          refreshSnapshots();
          setShowRollbackModal(null);
      }
    } catch (e) {
      setLastAction({ type: 'error', msg: 'فشل في استعادة النسخة.' });
    }
  };

  const clearSystem = async () => {
    const req = indexedDB.deleteDatabase('GIM_OS_Enterprise_DB');
    req.onsuccess = () => window.location.reload();
  };

  const initiateFormat = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setFormatCode(code);
    setUserInputCode('');
    setShowFormatModal(true);
  };

  return (
    <div className="p-8 space-y-10 animate-slide-up text-right font-arabic max-w-6xl mx-auto pb-24" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
             <Database className="text-blue-600" size={32} /> مركز أمن البيانات (Time Machine)
          </h2>
          <p className="text-slate-500 font-medium">نظام النسخ الاحتياطي التلقائي واسترجاع البيانات</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={handleExport}
                className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
                <Download size={18} /> تصدير JSON
            </button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
            >
                <Upload size={18} /> استيراد ملف
            </button>
        </div>
      </div>

      {lastAction && (
        <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 animate-in slide-in-from-top-4 ${
          lastAction.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
           {lastAction.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
           <p className="font-black text-sm">{lastAction.msg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Timeline - The Core Feature */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-4 border-slate-800 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8 relative z-10">
                      <div className="flex items-center gap-3">
                          <History className="text-blue-400" size={24} />
                          <h3 className="text-xl font-black">نقاط الاستعادة (System Snapshots)</h3>
                      </div>
                      <button onClick={refreshSnapshots} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                          <RefreshCw size={18} className={isLoadingHistory ? 'animate-spin' : ''} />
                      </button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                      {snapshots.map(snap => (
                          <div key={snap.versionId} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all group">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                                      snap.type === 'Manual' 
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                                        : snap.type === 'System'
                                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                            : 'bg-slate-700/50 border-slate-600 text-slate-400'
                                  }`}>
                                      {snap.type === 'Manual' ? <ShieldCheck size={20} /> : snap.type === 'System' ? <Box size={20} /> : <Clock size={20} />}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <p className="font-bold text-sm text-white">{snap.label}</p>
                                          {snap.type === 'Manual' && <span className="text-[8px] font-black bg-amber-500 text-black px-2 py-0.5 rounded">MANUAL SAVE</span>}
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                                          {new Date(snap.timestamp).toLocaleString('ar-MA')} • ID: {snap.versionId.substring(0, 8)}
                                      </p>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => setShowRollbackModal(snap.versionId)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 shadow-lg"
                              >
                                  <RotateCcw size={14} /> استرجاع
                              </button>
                          </div>
                      ))}
                      {snapshots.length === 0 && (
                          <div className="text-center py-10 opacity-30">
                              <Database size={48} className="mx-auto mb-4" />
                              <p className="text-sm font-bold">لا توجد نسخ احتياطية مسجلة</p>
                          </div>
                      )}
                  </div>
                  
                  {/* Background decoration */}
                  <Zap className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12 pointer-events-none" />
              </div>
          </div>

          {/* Stats & Tools */}
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <HardDrive size={20} className="text-green-600" /> حالة التخزين
                  </h3>
                  <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Clients Database</span>
                          <span className="text-slate-900">{state.clients.length} Records</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-3/4"></div>
                      </div>
                      
                      <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                          <span>Inventory</span>
                          <span className="text-slate-900">{state.inventory.length} Items</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-1/2"></div>
                      </div>

                      <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                          <span>Documents (Inv/Devis)</span>
                          <span className="text-slate-900">{state.documents.length} Files</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full w-2/3"></div>
                      </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-400">
                          <CheckCircle2 size={12} className="text-green-500" />
                          <span>System Integrity: 100%</span>
                      </div>
                  </div>
              </div>

              <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100">
                  <h3 className="text-lg font-black text-red-800 mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} /> منطقة الخطر
                  </h3>
                  <p className="text-xs text-red-600 font-bold leading-relaxed mb-6">
                      الإجراءات هنا نهائية ولا يمكن التراجع عنها. تأكد من تصدير نسخة احتياطية قبل المتابعة.
                  </p>
                  <button 
                      onClick={initiateFormat}
                      className="w-full bg-white border-2 border-red-200 text-red-600 py-3 rounded-xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                      <Trash2 size={14} /> تصفير النظام (Format)
                  </button>
              </div>
          </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-center p-10 space-y-6">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <RotateCcw size={40} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tighter">استعادة النظام؟</h3>
                      <p className="text-slate-500 font-bold mt-2 leading-relaxed">
                          هل تريد استعادة النظام لهذه النقطة الزمنية؟ سيتم فقدان أي تغييرات تمت بعد هذا التاريخ.
                      </p>
                  </div>
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={() => handleRollback(showRollbackModal)}
                          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
                      >
                          نعم، استعد البيانات
                      </button>
                      <button 
                          onClick={() => setShowRollbackModal(null)}
                          className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all"
                      >
                          إلغاء
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Format Confirmation Modal */}
      {showFormatModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-center p-10 space-y-6">
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <AlertTriangle size={40} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tighter">تصفير النظام بالكامل؟</h3>
                      <p className="text-slate-500 font-bold mt-2 leading-relaxed">
                          سيتم حذف كافة البيانات بشكل نهائي. لتأكيد الحذف، أدخل الكود التالي: <span className="text-red-600 font-black text-xl">{formatCode}</span>
                      </p>
                  </div>
                  <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center font-black text-2xl tracking-[1em] focus:border-red-500 outline-none transition-all"
                      placeholder="0000"
                      maxLength={4}
                      value={userInputCode}
                      onChange={(e) => setUserInputCode(e.target.value)}
                  />
                  <div className="flex flex-col gap-3">
                      <button 
                          disabled={userInputCode !== formatCode}
                          onClick={clearSystem}
                          className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all ${
                              userInputCode === formatCode 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                          تأكيد الحذف النهائي
                      </button>
                      <button 
                          onClick={() => setShowFormatModal(false)}
                          className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all"
                      >
                          إلغاء
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BackupPage;
