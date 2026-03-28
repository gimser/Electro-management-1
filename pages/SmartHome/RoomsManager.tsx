
import React, { useState } from 'react';
import { AppState, SmartRoom } from '../../types';
import { 
  Armchair, BedDouble, ChefHat, Trees, Monitor, 
  Thermometer, Droplets, Zap, ChevronRight, Settings,
  X, Plus, CheckCircle2
} from 'lucide-react';

interface RoomsManagerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const RoomsManager: React.FC<RoomsManagerProps> = ({ state, updateState }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    type: 'Living' as SmartRoom['type'],
    floor: 0
  });

  const getRoomIcon = (type: SmartRoom['type']) => {
    switch(type) {
      case 'Living': return <Armchair size={24} />;
      case 'Bedroom': return <BedDouble size={24} />;
      case 'Kitchen': return <ChefHat size={24} />;
      case 'Office': return <Monitor size={24} />;
      case 'Outdoor': return <Trees size={24} />;
      default: return <Armchair size={24} />;
    }
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');

    const newRoom: SmartRoom = {
      id: crypto.randomUUID(),
      companyId: state.identity.ice || 'GIM-ENT',
      deviceId: 'WEB-CLIENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      version: 1,
      name: formData.name,
      type: formData.type,
      floor: formData.floor,
      temperature: 22, // Default values
      humidity: 45,
      powerUsage: 0
    };

    setTimeout(() => {
      updateState(prev => ({
        ...prev,
        smartRooms: [...(prev.smartRooms || []), newRoom]
      }));
      setSaveStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus('idle');
        setFormData({ name: '', type: 'Living', floor: 0 });
      }, 1500);
    }, 800);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black text-slate-800 tracking-tighter">إدارة الفضاءات (Rooms)</h2>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-2"
         >
            <Plus size={18} /> إضافة غرفة
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {state.smartRooms?.map(room => {
            const deviceCount = state.iotDevices?.filter(d => d.roomId === room.id).length || 0;
            
            return (
               <div key={room.id} className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10 flex justify-between items-start mb-8">
                     <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {getRoomIcon(room.type)}
                     </div>
                     <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Settings size={20} /></button>
                  </div>

                  <div className="relative z-10 mb-6">
                     <h3 className="text-2xl font-black text-slate-800 mb-1">{room.name}</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{deviceCount} أجهزة متصلة</p>
                  </div>

                  <div className="relative z-10 grid grid-cols-3 gap-2">
                     <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                        <Thermometer size={16} className="mx-auto mb-1 text-red-500" />
                        <span className="text-xs font-black text-slate-700">{room.temperature}°</span>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                        <Droplets size={16} className="mx-auto mb-1 text-blue-500" />
                        <span className="text-xs font-black text-slate-700">{room.humidity}%</span>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                        <Zap size={16} className="mx-auto mb-1 text-amber-500" />
                        <span className="text-xs font-black text-slate-700">{room.powerUsage}W</span>
                     </div>
                  </div>

                  <button className="relative z-10 w-full mt-8 flex items-center justify-between bg-white border-2 border-slate-100 py-4 px-6 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all font-black text-xs uppercase group/btn">
                     <span>التحكم في الأجهزة</span>
                     <ChevronRight size={16} className="rotate-180 group-hover/btn:-translate-x-1 transition-transform" />
                  </button>
               </div>
            );
         })}
      </div>

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">إضافة فضاء جديد</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mr-1">اسم الغرفة / الفضاء</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="مثال: غرفة المعيشة"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mr-1">نوع الفضاء</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as SmartRoom['type']})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
                >
                  <option value="Living">غرفة معيشة (Living Room)</option>
                  <option value="Bedroom">غرفة نوم (Bedroom)</option>
                  <option value="Kitchen">مطبخ (Kitchen)</option>
                  <option value="Office">مكتب (Office)</option>
                  <option value="Outdoor">فضاء خارجي (Outdoor)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mr-1">الطابق</label>
                <input 
                  type="number" 
                  required
                  value={formData.floor}
                  onChange={e => setFormData({...formData, floor: parseInt(e.target.value)})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={saveStatus !== 'idle'}
                className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
                  saveStatus === 'success' ? 'bg-green-600' : 'bg-slate-900 hover:bg-blue-600'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <>جاري الحفظ...</>
                ) : saveStatus === 'success' ? (
                  <><CheckCircle2 size={20} /> تم الحفظ بنجاح</>
                ) : (
                  <><Plus size={20} /> إنشاء الفضاء</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsManager;
