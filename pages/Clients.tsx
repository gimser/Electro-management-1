
import React, { useState } from 'react';
import { AppState, Client, DocType, ClientType, CommunicationLog } from '../types';
import { 
  Plus, Search, Trash2, Edit2, UserPlus, Star, TrendingUp, 
  AlertCircle, Heart, Crown, Building2, User, Phone, 
  Mail, MapPin, History, MessageSquare, ClipboardList,
  X, Save, FileText, CheckCircle2, ChevronRight, BarChart3,
  Users, Filter, MoreHorizontal
} from 'lucide-react';

interface ClientsPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt'>>({
    name: '',
    clientType: 'Individual',
    ice: '',
    phone: '',
    email: '',
    address: '',
    city: 'الدار البيضاء',
    category: 'Standard',
    loyaltyScore: 50,
    internalNotes: '',
    communicationHistory: []
  });

  const getClientStats = (clientId: string) => {
    const clientDocs = state.documents.filter(d => d.clientId === clientId && d.type === DocType.FACTURE);
    const totalSpent = clientDocs.filter(d => d.status === 'Paid').reduce((acc, d) => acc + d.total, 0);
    const isVIP = totalSpent > 50000 || clientDocs.length > 10;
    const returnProb = Math.min(100, (clientDocs.length * 15) + (isVIP ? 20 : 0));
    return { totalSpent, isVIP, returnProb };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateState(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === editingClient.id ? { ...c, ...formData } : c)
      }));
    } else {
      const newClient: Client = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      updateState(prev => ({
        ...prev,
        clients: [...prev.clients, newClient]
      }));
    }
    resetForm();
  };

  const handleDeleteClient = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('⚠️ حذف نهائي: هل أنت متأكد من مسح هذا الزبون وسجله بالكامل؟')) {
      updateState(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id),
        automationLogs: [{
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action: 'CLIENT_REMOVED',
          status: 'success',
          details: `تم حذف الزبون نهائياً من قاعدة البيانات.`
        }, ...(prev.automationLogs || [])]
      }));
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', clientType: 'Individual', ice: '', phone: '', email: '', address: '', city: 'الدار البيضاء',
      category: 'Standard', loyaltyScore: 50, internalNotes: '', communicationHistory: []
    });
    setEditingClient(null);
    setShowForm(false);
  };

  const filteredClients = state.clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.ice && c.ice.includes(search)) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-10 animate-slide-up text-right" dir="rtl">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-blue-600"></div>
        <div className="w-full lg:w-1/2 space-y-4">
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة قاعدة الزبائن (Unified CRM)</h2>
           <div className="relative">
              <Search className="absolute right-5 top-4.5 text-slate-400" size={22} />
              <input 
                type="text" 
                placeholder="البحث بالاسم، ICE، الهاتف، أو المدينة..." 
                className="w-full pr-14 pl-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
           <button onClick={() => setShowForm(true)} className="flex-1 lg:flex-none bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-500 active:scale-95 transition-all uppercase tracking-widest text-xs">
              <UserPlus size={20} /> إضافة شريك عمل
           </button>
           <button className="p-5 bg-slate-900 text-white rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl active:scale-90">
              <Filter size={20} />
           </button>
        </div>
      </div>

      {/* Clients Table / Matrix */}
      <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">ملف الهوية</th>
                <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">الموقع</th>
                <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">حجم المعاملات</th>
                <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">درجة الولاء</th>
                <th className="px-10 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-left">التفاعل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map((client) => {
                const { totalSpent, isVIP, returnProb } = getClientStats(client.id);
                return (
                  <tr key={client.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-sm border-2 transition-all ${isVIP ? 'bg-amber-600 text-white border-amber-400 rotate-3' : 'bg-slate-900 text-white border-slate-800'}`}>
                          {isVIP ? <Crown size={30} /> : client.clientType === 'Company' ? <Building2 size={30} /> : <User size={30} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{client.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${client.clientType === 'Company' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {client.clientType === 'Company' ? 'Enterprise' : 'Personal'}
                             </span>
                             {client.ice && <span className="text-[8px] font-mono font-black text-slate-400">ICE: {client.ice}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center gap-1">
                          <p className="text-sm font-black text-slate-700">{client.city}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{client.address}</p>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="bg-slate-100/50 inline-block px-4 py-2 rounded-2xl border border-slate-100 group-hover:border-blue-200 transition-all">
                          <p className="text-lg font-black text-slate-900 font-mono tracking-tighter">{totalSpent.toLocaleString()} <span className="text-xs text-slate-400">DH</span></p>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-1.5">
                             <span className={`text-xs font-black ${returnProb > 70 ? 'text-green-600' : 'text-blue-600'}`}>{returnProb}%</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                             <div className={`h-full transition-all duration-1000 ${returnProb > 70 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${returnProb}%`}}></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-left">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-500">
                          <a href={`tel:${client.phone}`} className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-md active:scale-90"><Phone size={20} /></a>
                          <button onClick={() => { setEditingClient(client); setFormData({...client}); setShowForm(true); }} className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-90"><Edit2 size={20} /></button>
                          <button onClick={(e) => handleDeleteClient(client.id, e)} className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-90"><Trash2 size={20} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center opacity-30">
                    <Users size={80} className="mx-auto mb-6 text-slate-200" />
                    <p className="font-black text-2xl uppercase tracking-widest text-slate-300">قاعدة بيانات الزبائن فارغة</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-500">
             <div className="p-10 bg-blue-600 text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-3xl font-black tracking-tighter uppercase">{editingClient ? 'تحرير بيانات شريك' : 'تسجيل شريك جديد'}</h3>
                   <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-80">GIM Operational Database Entry</p>
                </div>
                <button onClick={resetForm} className="relative z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all active:scale-90 shadow-xl"><X size={28} /></button>
                <Users className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
             </div>
             
             <form onSubmit={handleSubmit} className="p-12 space-y-8" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest mr-2">هوية الشريك</label>
                      <div className="flex gap-4 p-2 bg-slate-50 border border-slate-100 rounded-[2rem]">
                         {['Individual', 'Company'].map(type => (
                            <button 
                               key={type}
                               type="button"
                               onClick={() => setFormData({...formData, clientType: type as ClientType})}
                               className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs transition-all flex items-center justify-center gap-3 ${formData.clientType === type ? 'bg-white shadow-xl text-blue-600 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                               {type === 'Individual' ? <User size={18} /> : <Building2 size={18} />}
                               {type === 'Individual' ? 'زبون شخصي' : 'شركة / مقاولة'}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="md:col-span-2 space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الاسم الكامل / الاسم التجاري</label>
                      <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" placeholder="أدخل الاسم الرسمي هنا..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>

                   {formData.clientType === 'Company' && (
                      <div className="md:col-span-2 space-y-4 animate-in slide-in-from-top-4">
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الرقم الموحد للمقاولة (ICE)</label>
                         <input className="w-full px-8 py-5 bg-blue-50 border-2 border-blue-100 rounded-3xl font-mono text-blue-700 font-black focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="00XXXXXXXXXXXXX" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} />
                      </div>
                   )}

                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم الهاتف الرسمي</label>
                      <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner text-left" placeholder="+212 6..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                   </div>

                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المدينة</label>
                      <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                   </div>

                   <div className="md:col-span-2 space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">العنوان الكامل</label>
                      <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                   </div>
                </div>

                <button type="submit" className="w-full bg-[#0f172a] text-white font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all uppercase tracking-widest text-xs mt-6 active:scale-95">
                   <Save size={24} /> {editingClient ? 'تحديث السجلات التقنية' : 'تثبيت الشريك في قاعدة البيانات'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
