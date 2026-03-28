
import React from 'react';
import { AppState } from '../types';
import { 
  Activity, ShieldCheck, AlertTriangle, Radio, 
  Server, Router, Cpu, Signal, CheckCircle2, 
  Terminal, Globe, Zap, Network
} from 'lucide-react';

interface NetworkDashboardProps {
  state: AppState;
}

const NetworkDashboard: React.FC<NetworkDashboardProps> = ({ state }) => {
  const totalDevices = state.networkDevices.length;
  const onlineDevices = state.networkDevices.filter(d => d.status === 'Online').length;
  const warningDevices = state.networkDevices.filter(d => d.status === 'Warning' || d.status === 'Predictive-Failure').length;
  const offlineDevices = state.networkDevices.filter(d => d.status === 'Offline').length;

  return (
    <div className="p-8 space-y-10 animate-slide-up text-right font-arabic max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
             <Radio className="text-blue-600 animate-pulse" size={32} /> GIM Network Operations Center (NOC)
          </h2>
          <p className="text-slate-500 font-medium">مراقبة حية للبنية التحتية والأنظمة المتصلة لزبائن Electro GIM</p>
        </div>
        <div className="bg-slate-900 text-green-400 px-6 py-3 rounded-2xl font-mono text-xs flex items-center gap-3 shadow-xl">
           <Terminal size={16} /> [SYS] Monitoring Engine: ACTIVE
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-500 transition-all">
            <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
               <Network size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الأجهزة</p>
            <p className="text-4xl font-black text-slate-800 font-mono">{totalDevices}</p>
            <Zap className="absolute -right-4 -bottom-4 text-slate-50 w-24 h-24" />
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-green-500 transition-all">
            <div className="bg-green-50 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
               <CheckCircle2 size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">متصل (Online)</p>
            <p className="text-4xl font-black text-green-600 font-mono">{onlineDevices}</p>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-amber-500 transition-all">
            <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
               <AlertTriangle size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تحذيرات / فشل متوقع</p>
            <p className="text-4xl font-black text-amber-600 font-mono">{warningDevices}</p>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-red-500 transition-all">
            <div className="bg-red-50 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
               <Signal size={24} className="rotate-180" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">غير متصل (Down)</p>
            <p className="text-4xl font-black text-red-600 font-mono">{offlineDevices}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Live Incidents */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
                     <Activity className="text-blue-600" /> خريطة استقرار الشبكات (Stability Map)
                  </h3>
                  <button className="text-[10px] font-black text-blue-600 uppercase border-b-2 border-blue-100">عرض كافة التفاصيل</button>
               </div>
               <div className="p-8 flex-1">
                  {state.networkDevices.length > 0 ? (
                    <div className="space-y-4">
                       {state.networkDevices.slice(0, 5).map(device => (
                          <div key={device.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                             <div className="flex items-center gap-6">
                                <div className={`w-3 h-3 rounded-full ${device.status === 'Online' ? 'bg-green-500 animate-pulse' : device.status === 'Offline' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                <div>
                                   <p className="font-black text-slate-800 text-sm">{device.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">{device.ip} • {device.type}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-8">
                                <div className="text-left">
                                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الاستقرار (Uptime)</p>
                                   <p className={`text-sm font-black font-mono ${device.uptime < 90 ? 'text-red-500' : 'text-slate-800'}`}>{device.uptime}%</p>
                                </div>
                                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                   <div className={`h-full ${device.uptime < 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${device.uptime}%`}}></div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40">
                       <Server size={64} />
                       <p className="font-black uppercase text-xs">لا توجد أجهزة مضافة للمراقبة حالياً</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Predictive Insights */}
         <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
                  <Cpu className="text-blue-400" /> التنبؤ بالأعطال (AI-P)
               </h3>
               <div className="space-y-6 relative z-10">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                     <p className="text-blue-300 text-[10px] font-black uppercase mb-2 tracking-widest">تحليل الحرارة والضغط</p>
                     <p className="text-slate-400 text-xs font-bold leading-relaxed">
                        بناءً على الأداء الأخير، جميع السيرفرات تعمل ضمن النطاق الآمن. لا توجد مؤشرات لارتفاع الحرارة.
                     </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
                     <p className="text-red-400 text-[10px] font-black uppercase mb-2 tracking-widest">تنبيه حرج (متوقع)</p>
                     <p className="text-slate-200 text-xs font-bold leading-relaxed">
                        سويتش الزبون (X-Mall) يظهر انقطاعات متكررة كل 4 ساعات. احتمال فشل الباور سبلاي 85%.
                     </p>
                  </div>
               </div>
               <Activity className="absolute -right-20 -bottom-20 text-white/5 w-80 h-80 pointer-events-none" />
            </div>

            <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-xl">
               <div className="flex items-center gap-4 mb-6">
                  <Globe size={32} className="text-blue-100" />
                  <h3 className="text-xl font-black">الربط السحابي</h3>
               </div>
               <p className="text-blue-100 text-xs font-bold leading-relaxed opacity-80">
                  تم دمج GIM-NOC مع واجهة Cloudflare للحماية. نظام الـ Webhooks يراقب أي محاولة اختراق للشبكات المحلية للزبناء.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NetworkDashboard;
