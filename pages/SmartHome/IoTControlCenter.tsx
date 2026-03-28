
import React, { useState } from 'react';
import { AppState, IoTDevice, IoTDeviceType, IoTProtocol } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Cpu, Server, Activity, Power, Settings, 
  RefreshCw, Wifi, Radio, Lock, Eye, Terminal,
  Plus, Save, X, Search, Radar, CheckCircle2, AlertOctagon, User
} from 'lucide-react';

interface IoTControlCenterProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const IoTControlCenter: React.FC<IoTControlCenterProps> = ({ state, updateState }) => {
  const { user: authUser } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [formData, setFormData] = useState<Omit<IoTDevice, 'id' | 'status' | 'lastPing' | 'state' | 'powerConsumption'>>({
    clientId: state.clients[0]?.id || '',
    roomId: state.smartRooms[0]?.id || '',
    name: '',
    type: 'Sensor',
    protocol: 'WiFi',
    ipAddress: '',
    macAddress: '',
    port: 80,
    firmware: '1.0.0'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- محاكاة تتبع حالة الاتصال بشكل دوري ---
  React.useEffect(() => {
    const interval = setInterval(() => {
      updateState(prev => ({
        ...prev,
        iotDevices: prev.iotDevices.map(d => {
          // محاكاة تغير بسيط في الـ Latency
          const jitter = Math.floor(Math.random() * 10) - 5;
          const newPing = Math.max(5, d.lastPing + jitter);
          
          // محاكاة انقطاع اتصال عشوائي بنسبة ضئيلة جداً (0.5%)
          const shouldFlip = Math.random() < 0.005;
          const newStatus = shouldFlip ? (d.status === 'Online' ? 'Offline' : 'Online') : d.status;
          
          return { ...d, lastPing: newPing, status: newStatus as any };
        })
      }));
    }, 5000); // كل 5 ثواني

    return () => clearInterval(interval);
  }, []);

  const refreshAllDevices = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      updateState(prev => ({
        ...prev,
        iotDevices: prev.iotDevices.map(d => ({
          ...d,
          status: 'Online',
          lastPing: Math.floor(Math.random() * 30) + 10
        }))
      }));
      setIsRefreshing(false);
    }, 1500);
  };

  const togglePower = (id: string) => {
    updateState(prev => ({
      ...prev,
      iotDevices: prev.iotDevices.map(d => 
        d.id === id ? { ...d, state: { ...d.state, on: !d.state.on } } : d
      )
    }));
  };

  // --- محاكاة البحث عن أجهزة في الشبكة ---
  const handleNetworkScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // محاكاة العثور على جهاز
      const randomIP = `192.168.1.${Math.floor(Math.random() * 200) + 50}`;
      const randomMac = `AA:BB:${Math.floor(Math.random() * 99)}:${Math.floor(Math.random() * 99)}`;
      setFormData({
        ...formData,
        name: 'New Smart Device (Discovered)',
        ipAddress: randomIP,
        macAddress: randomMac,
        protocol: 'Zigbee',
        type: 'Sensor'
      });
      alert(`تم اكتشاف جهاز جديد في الشبكة!\nIP: ${randomIP}`);
    }, 2000);
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
       alert("المرجو اختيار الزبون المالك للجهاز.");
       return;
    }

    const newDevice: IoTDevice = {
      ...formData,
      id: crypto.randomUUID(),
      status: 'Online',
      lastPing: Math.floor(Math.random() * 20) + 5,
      powerConsumption: Math.floor(Math.random() * 50),
      state: { on: true }
    };

    updateState(prev => ({
      ...prev,
      iotDevices: [...prev.iotDevices, newDevice],
      activityLogs: [{
        id: crypto.randomUUID(),
        userId: authUser?.id || 'system',
        username: authUser?.fullName || 'System',
        action: 'IOT_DEVICE_PROVISIONED',
        module: 'SMART_HOME',
        timestamp: new Date().toISOString(),
        details: `Device Provisioned: ${newDevice.name} [${newDevice.protocol}] for Client: ${state.clients.find(c => c.id === newDevice.clientId)?.name}`,
        severity: 'Info'
      }, ...(prev.activityLogs || [])]
    }));

    setShowAddModal(false);
    // Reset form
    setFormData({
       clientId: state.clients[0]?.id || '', 
       roomId: state.smartRooms[0]?.id || '', 
       name: '', type: 'Sensor', 
       protocol: 'WiFi', ipAddress: '', macAddress: '', port: 80, firmware: '1.0.0'
    });
  };

  return (
    <div className="p-8 h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 text-right" dir="rtl">
      
      {/* Left Panel: Device List */}
      <div className="w-full lg:w-1/3 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
         <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Cpu className="text-blue-600" /> IoT Registry
               </h2>
               <p className="text-xs font-bold text-slate-400 mt-2">سجل الأجهزة المتصلة</p>
            </div>
            <div className="flex gap-2">
               <button 
                  onClick={refreshAllDevices}
                  disabled={isRefreshing}
                  className={`p-3 rounded-xl border-2 border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
               >
                  <RefreshCw size={20} />
               </button>
               <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-slate-900 text-white p-3 rounded-xl shadow-lg hover:bg-blue-600 transition-all active:scale-90"
               >
                  <Plus size={20} />
               </button>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {state.iotDevices.map(device => {
               const client = state.clients.find(c => c.id === device.clientId);
               return (
                  <div 
                     key={device.id}
                     onClick={() => setSelectedDevice(device)}
                     className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all relative overflow-hidden group ${selectedDevice?.id === device.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-300'}`}
                  >
                     {/* Status Indicator Bar */}
                     <div className={`absolute top-0 left-0 w-1.5 h-full ${device.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                     
                     <div className="flex justify-between items-start mb-2 pl-2">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full animate-pulse ${device.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                           <div>
                              <h4 className="font-black text-slate-800 text-sm">{device.name}</h4>
                              {client && (
                                 <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                    <User size={10} /> {client.name}
                                 </p>
                              )}
                           </div>
                        </div>
                        <span className="text-[9px] font-black bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">{device.protocol}</span>
                     </div>
                     <div className="flex justify-between items-center pl-2">
                        <p className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{device.ipAddress}</p>
                        <p className="text-[10px] font-black text-blue-600">{state.smartRooms.find(r => r.id === device.roomId)?.name}</p>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Right Panel: Device Detail / Config */}
      <div className="flex-1 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col">
         {selectedDevice ? (
            <>
               <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-black">{selectedDevice.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2 ${selectedDevice.status === 'Online' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                           {selectedDevice.status === 'Online' ? <CheckCircle2 size={12} /> : <AlertOctagon size={12} />}
                           {selectedDevice.status}
                        </span>
                     </div>
                     <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 items-center">
                        <span className="bg-white/10 px-2 py-1 rounded text-white flex items-center gap-2"><User size={12}/> {state.clients.find(c => c.id === selectedDevice.clientId)?.name || 'Unknown Client'}</span>
                        <span>MAC: {selectedDevice.macAddress}</span>
                        <span>|</span>
                        <span>FW: {selectedDevice.firmware}</span>
                        <span>|</span>
                        <span>Room: {state.smartRooms.find(r => r.id === selectedDevice.roomId)?.name}</span>
                     </div>
                  </div>
                  <button 
                     onClick={() => togglePower(selectedDevice.id)}
                     className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl border-4 transition-all ${selectedDevice.state.on ? 'bg-green-500 border-green-400 text-white shadow-green-500/50' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                     <Power size={28} />
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Activity size={14} /> Network Latency</p>
                     <p className="text-3xl font-mono font-black text-green-400">{selectedDevice.lastPing} <span className="text-sm text-white">ms</span></p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><RefreshCw size={14} /> Power Draw</p>
                     <p className="text-3xl font-mono font-black text-amber-400">{selectedDevice.powerConsumption} <span className="text-sm text-white">W</span></p>
                  </div>
               </div>

               <div className="bg-black/40 border border-white/5 rounded-3xl p-6 font-mono text-xs text-green-500 overflow-y-auto flex-1 custom-scrollbar relative z-10 shadow-inner">
                  <p className="text-slate-500 border-b border-white/10 pb-2 mb-2">[TCP/IP LOG STREAM] Connection Established {selectedDevice.ipAddress}:{selectedDevice.port}</p>
                  <p>&gt; Sending Handshake... ACK</p>
                  <p>&gt; Protocol: {selectedDevice.protocol} Secure V2</p>
                  <p>&gt; Client Context: {state.clients.find(c => c.id === selectedDevice.clientId)?.name} (Authorized)</p>
                  <p>&gt; State Polling: OK (Heartbeat active)</p>
                  <p>&gt; {selectedDevice.state.on ? 'Device Status: OPERATIONAL' : 'Device Status: STANDBY'}</p>
                  <p>&gt; Security: TLS 1.3 Encrypted</p>
                  <p className="animate-pulse">_</p>
               </div>

               <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
            </>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
               <Server size={64} className="mb-4 opacity-50 animate-pulse" />
               <p className="text-xl font-black uppercase">اختر جهازاً لعرض التفاصيل التقنية</p>
               <p className="text-xs font-bold text-slate-700 mt-2">Waiting for selection...</p>
            </div>
         )}
      </div>

      {/* --- ADD DEVICE MODAL --- */}
      {showAddModal && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
               
               <div className="p-8 bg-blue-600 text-white flex justify-between items-center shrink-0">
                  <div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter">إضافة جهاز جديد</h3>
                     <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mt-1">IoT Device Provisioning</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all"><X size={24} /></button>
               </div>

               <form onSubmit={handleAddDevice} className="p-10 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* Auto-Scan Button */}
                  <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-[2rem] flex justify-between items-center">
                     <div>
                        <h4 className="font-black text-slate-800">البحث الآلي في الشبكة</h4>
                        <p className="text-xs text-slate-500 mt-1">بروتوكول اكتشاف الأجهزة (UPnP / mDNS)</p>
                     </div>
                     <button 
                        type="button"
                        onClick={handleNetworkScan}
                        disabled={isScanning}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                     >
                        {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <Radar size={16} />}
                        {isScanning ? 'جاري المسح...' : 'Scan Network'}
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الزبون المالك (Client)</label>
                        <select 
                           required 
                           className="w-full px-6 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-blue-900"
                           value={formData.clientId} 
                           onChange={e => setFormData({...formData, clientId: e.target.value})}
                        >
                           <option value="">-- اختر الزبون --</option>
                           {state.clients.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                           ))}
                        </select>
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">اسم الجهاز</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: Smart Light Living Room" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>
                     
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">نوع الجهاز</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as IoTDeviceType})}>
                           <option value="Light">إضاءة ذكية (Light)</option>
                           <option value="AC">تكييف (AC)</option>
                           <option value="Lock">قفل ذكي (Lock)</option>
                           <option value="Camera">كاميرا (Camera)</option>
                           <option value="Sensor">حساس (Sensor)</option>
                           <option value="Outlet">مقبس (Outlet)</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الغرفة</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                           {state.smartRooms.map(room => (
                              <option key={room.id} value={room.id}>{room.name}</option>
                           ))}
                        </select>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">بروتوكول الاتصال</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.protocol} onChange={e => setFormData({...formData, protocol: e.target.value as IoTProtocol})}>
                           <option value="WiFi">WiFi</option>
                           <option value="Zigbee">Zigbee</option>
                           <option value="Z-Wave">Z-Wave</option>
                           <option value="MQTT">MQTT</option>
                           <option value="RTSP">RTSP (Cameras)</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">Port</label>
                        <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.port} onChange={e => setFormData({...formData, port: parseInt(e.target.value)})} />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">عنوان IP</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-black text-blue-600" placeholder="192.168.X.X" value={formData.ipAddress} onChange={e => setFormData({...formData, ipAddress: e.target.value})} />
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 text-xs uppercase tracking-widest mt-4">
                     <Save size={20} /> حفظ وإضافة للنظام
                  </button>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default IoTControlCenter;
