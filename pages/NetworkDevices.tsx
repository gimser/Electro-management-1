
import React, { useState } from 'react';
import { AppState, NetworkDevice, DeviceType, DeviceStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Trash2, Edit2, Router, Server, 
  Wifi, Cpu, Monitor, HardDrive, ShieldAlert, 
  X, Save, Network, Activity, Info, MapPin, 
  Fingerprint, Database, Zap
} from 'lucide-react';

interface NetworkDevicesProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const NetworkDevices: React.FC<NetworkDevicesProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState<Omit<NetworkDevice, 'id' | 'uptime' | 'lastSeen'>>({
    clientId: '',
    name: '',
    ip: '',
    macAddress: '',
    type: 'Router',
    status: 'Online',
    modelName: '',
    firmwareVersion: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert('يرجى اختيار زبون');

    const newDevice: NetworkDevice = {
      ...formData,
      id: crypto.randomUUID(),
      uptime: 100,
      lastSeen: new Date().toISOString()
    };

    updateState(prev => ({
      ...prev,
      networkDevices: [newDevice, ...(prev.networkDevices || [])],
      activityLogs: [{
        id: crypto.randomUUID(),
        userId: authUser?.id || 'system',
        username: authUser?.fullName || 'System',
        action: 'NETWORK_DEVICE_ADDED',
        module: 'NOC',
        timestamp: new Date().toISOString(),
        details: `إضافة جهاز شبكة جديد: ${newDevice.name} (${newDevice.ip})`,
        severity: 'Info'
      }, ...(prev.activityLogs || [])]
    }));

    resetForm();
  };

  const resetForm = () => {
    setFormData({ clientId: '', name: '', ip: '', macAddress: '', type: 'Router', status: 'Online', modelName: '', firmwareVersion: '', notes: '' });
    setShowForm(false);
  };

  const deleteDevice = (id: string) => {
    if (confirm('هل أنت متأكد من مسح هذا الجهاز من المراقبة؟')) {
      updateState(prev => ({
        ...prev,
        networkDevices: prev.networkDevices.filter(d => d.id !== id)
      }));
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch(type) {
      case 'Router': return <Router className="text-blue-500" />;
      case 'Switch': return <Network className="text-purple-500" />;
      case 'Server': return <Server className="text-indigo-500" />;
      case 'AccessPoint': return <Wifi className="text-amber-500" />;
      case 'IP-Camera': return <Monitor className="text-slate-500" />;
      case 'Firewall': return <ShieldAlert className="text-red-500" />;
      default: return <Database className="text-slate-400" />;
    }
  };

  const filteredDevices = (state.networkDevices || []).filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.ip.includes(search)
  );

  return (
    <div className="p-8 animate-slide-up text-right font-arabic max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
             <Database className="text-blue-600" size={32} /> جرد أجهزة البنية التحتية
          </h2>
          <p className="text-slate-500 font-medium">إدارة وتوثيق كافة المعدات التقنية الموزعة في مواقع الزبناء</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={20} /> إضافة جهاز للشبكة
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <div className="relative max-w-md w-full">
               <Search className="absolute right-4 top-3 text-slate-400" size={18} />
               <input 
                  className="w-full pr-12 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none text-sm" 
                  placeholder="بحث باسم الجهاز أو عنوان IP..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-right">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-5">الجهاز / الموديل</th>
                     <th className="px-8 py-5 text-center">الزبون</th>
                     <th className="px-8 py-5 text-center">IP Address</th>
                     <th className="px-8 py-5 text-center">حالة الاتصال</th>
                     <th className="px-8 py-5 text-left">الإجراءات</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredDevices.map(device => (
                     <tr key={device.id} className="hover:bg-blue-50/20 transition-all group">
                        <td className="px-8 py-5 flex items-center gap-4">
                           <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-white shadow-inner">{getDeviceIcon(device.type)}</div>
                           <div>
                              <p className="font-black text-slate-800 text-sm">{device.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{device.modelName || 'بدون موديل'}</p>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className="text-xs font-bold text-slate-600">{state.clients.find(c => c.id === device.clientId)?.name}</span>
                        </td>
                        <td className="px-8 py-5 text-center font-black font-mono text-sm text-blue-600">{device.ip}</td>
                        <td className="px-8 py-5 text-center">
                           <span className={`px-4 py-1 rounded-full text-[9px] font-black border ${
                              device.status === 'Online' ? 'bg-green-50 text-green-700 border-green-200' : 
                              device.status === 'Offline' ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-amber-50 text-amber-700 border-amber-200'
                           }`}>
                              {device.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-left">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => deleteDevice(device.id)} className="p-2 text-slate-300 hover:text-red-600"><Trash2 size={18}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">تسجيل أصل تقني جديد</h3>
                   <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-1">GIM Asset Management System</p>
                </div>
                <button onClick={resetForm} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">اختيار الزبون المالك</label>
                      <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                         <option value="">-- اختر الزبون --</option>
                         {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">اسم الجهاز</label>
                      <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="مثال: Router-Main-V1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">نوع الجهاز</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as DeviceType})}>
                         <option value="Router">Router (راوتر)</option>
                         <option value="Switch">Switch (سويتش)</option>
                         <option value="AccessPoint">Access Point (واي فاي)</option>
                         <option value="Server">Server (سيرفر)</option>
                         <option value="IP-Camera">IP Camera (كاميرا)</option>
                         <option value="Firewall">Firewall (جدار ناري)</option>
                         <option value="UPS">UPS (مزود طاقة)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">IP Address</label>
                      <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-black text-blue-600" placeholder="192.168.1.1" value={formData.ip} onChange={e => setFormData({...formData, ip: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">MAC Address</label>
                      <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono" placeholder="00:00:00:00:00:00" value={formData.macAddress} onChange={e => setFormData({...formData, macAddress: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">الموديل (Model)</label>
                      <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="مثال: RB4011iGS+" value={formData.modelName} onChange={e => setFormData({...formData, modelName: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">إصدار النظام (Firmware)</label>
                      <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="مثال: RouterOS v7.1" value={formData.firmwareVersion} onChange={e => setFormData({...formData, firmwareVersion: e.target.value})} />
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                   <Save size={20} /> تثبيت الجهاز في نظام المراقبة
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkDevices;
