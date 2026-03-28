
import React, { useState } from 'react';
import { AppState, Client, DocType, ClientType, CommunicationLog } from '../types';
import { createSnapshot, createCheckpoint } from '../db';
import { useAuth } from '../context/AuthContext';
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
  const { user: authUser } = useAuth();
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
    serviceCategory: 'صيانة الأجهزة',
    loyaltyScore: 50,
    internalNotes: '',
    communicationHistory: [],
    managerName: '',
    serviceSize: 'صغير',
    description: '',
    status: 'جديد'
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
    
    // Simple validation
    if (!formData.name || !formData.phone || !formData.city || !formData.description) {
      alert('يرجى ملء جميع الحقول الإجبارية');
      return;
    }
    
    if (formData.clientType === 'Company' && (!formData.managerName || !formData.email)) {
      alert('يرجى ملء جميع حقول الشركة الإجبارية');
      return;
    }

    if (editingClient) {
      updateState(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === editingClient.id ? { ...c, ...formData, updatedAt: new Date().toISOString() } : c)
      }));
    } else {
      const newClient: Client = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId: authUser?.companyId || 'GIM-001',
        deviceId: 'WEB-CLIENT',
        syncStatus: 'synced',
        version: 1,
        status: 'جديد'
      };
      updateState(prev => ({
        ...prev,
        clients: [...prev.clients, newClient]
      }));
    }
    resetForm();
  };

  const handleDeleteClient = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('⚠️ حذف نهائي: هل أنت متأكد من مسح هذا الزبون وسجله بالكامل؟')) {
      
      // --- MANUAL SNAPSHOT FOR SAFETY ---
      await createCheckpoint(state, `Backup before deleting client ID: ${id.substring(0,8)}`);
      
      updateState(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id),
        automationLogs: [{
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          username: authUser?.fullName || 'System',
          action: 'CLIENT_REMOVED',
          status: 'success',
          details: `تم حذف الزبون نهائياً من قاعدة البيانات (Snapshot Created).`
        }, ...(prev.automationLogs || [])]
      }));
    }
  };

  const handleDeleteAllClients = async () => {
    if (state.clients.length === 0) return;
    
    if (window.confirm('🚨 تحذير شديد: هل أنت متأكد من حذف جميع الزبائن؟ لا يمكن التراجع عن هذه العملية!')) {
      const confirmCode = Math.floor(1000 + Math.random() * 9000).toString();
      const userInput = window.prompt(`لتأكيد الحذف النهائي لـ ${state.clients.length} زبون، يرجى إدخال الرمز التالي: ${confirmCode}`);
      
      if (userInput === confirmCode) {
        // --- MANUAL SNAPSHOT FOR SAFETY ---
        await createCheckpoint(state, `Full Wipe: Deleting all ${state.clients.length} clients`);
        
        updateState(prev => ({
          ...prev,
          clients: [],
          automationLogs: [{
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            username: authUser?.fullName || 'System',
            action: 'ALL_CLIENTS_REMOVED',
            status: 'success',
            details: `تم مسح قاعدة بيانات الزبائن بالكامل (${state.clients.length} سجل). تم إنشاء نسخة احتياطية تلقائية.`
          }, ...(prev.automationLogs || [])]
        }));
        alert('تم حذف جميع الزبائن بنجاح.');
      } else {
        alert('فشل التأكيد. لم يتم حذف أي بيانات.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', clientType: 'Individual', ice: '', phone: '', email: '', address: '', city: 'الدار البيضاء',
      category: 'Standard', loyaltyScore: 50, internalNotes: '', communicationHistory: [],
      managerName: '', serviceSize: 'صغير', description: '', status: 'جديد'
    });
    setEditingClient(null);
    setShowForm(false);
  };

  const stats = React.useMemo(() => {
    const total = state.clients.length;
    const companies = state.clients.filter(c => c.clientType === 'Company').length;
    const individuals = total - companies;
    const vips = state.clients.filter(c => getClientStats(c.id).isVIP).length;
    const totalRevenue = state.documents
      .filter(d => (d.type === DocType.FACTURE || d.type === DocType.TICKET) && d.status === 'Paid')
      .reduce((acc, d) => acc + d.total, 0);
    
    return { total, companies, individuals, vips, totalRevenue };
  }, [state.clients, state.documents]);

  const [filterType, setFilterType] = useState<ClientType | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredClients = React.useMemo(() => {
    const seen = new Set();
    return state.clients
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                            (c.ice && c.ice.includes(search)) ||
                            c.phone.includes(search) ||
                            c.city.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'All' || c.clientType === filterType;
        const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
        
        return matchesSearch && matchesType && matchesCategory;
      })
      .filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
  }, [state.clients, search, filterType, filterCategory]);

  return (
    <div className="space-y-8 animate-slide-up text-right pb-24" dir="rtl">
      
      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-blue-500 transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الزبائن</p>
            <p className="text-3xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-indigo-500 transition-all">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Building2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الشركات</p>
            <p className="text-3xl font-black text-slate-800">{stats.companies}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-amber-500 transition-all">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
            <Crown size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كبار الزبائن (VIP)</p>
            <p className="text-3xl font-black text-slate-800">{stats.vips}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-emerald-500 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المداخيل</p>
            <p className="text-2xl font-black text-slate-800 font-mono">{stats.totalRevenue.toLocaleString()} <span className="text-xs">DH</span></p>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="w-full lg:w-1/2 relative">
            <Search className="absolute right-5 top-4.5 text-slate-400" size={22} />
            <input 
              type="text" 
              placeholder="البحث بالاسم، الهاتف، المدينة..." 
              className="w-full pr-14 pl-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <button onClick={() => setShowForm(true)} className="flex-1 lg:flex-none bg-blue-600 text-white px-8 py-4.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-blue-500 active:scale-95 transition-all text-xs">
              <Plus size={18} /> إضافة زبون
            </button>
            <button onClick={handleDeleteAllClients} className="flex-1 lg:flex-none bg-red-50 text-red-600 px-6 py-4.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white active:scale-95 transition-all text-xs">
              <Trash2 size={18} /> حذف الكل
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50">
          <button 
            onClick={() => setFilterType('All')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            الكل
          </button>
          <button 
            onClick={() => setFilterType('Individual')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'Individual' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            أفراد
          </button>
          <button 
            onClick={() => setFilterType('Company')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'Company' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            شركات
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          {['Standard', 'Premium', 'VIP'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? 'All' : cat)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">الزبون</th>
                <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">التواصل</th>
                <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">الموقع</th>
                <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-center">النشاط</th>
                <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map((client) => {
                const { totalSpent, isVIP, returnProb } = getClientStats(client.id);
                return (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border-2 transition-all ${isVIP ? 'bg-amber-500 text-white border-amber-300' : 'bg-slate-900 text-white border-slate-800'}`}>
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900 text-base">{client.name}</p>
                            {isVIP && <Crown size={14} className="text-amber-500" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${client.clientType === 'Company' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                              {client.clientType === 'Company' ? 'Enterprise' : 'Personal'}
                            </span>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase bg-amber-50 text-amber-700 border border-amber-100">
                              {client.category || 'Standard'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs font-black text-slate-700">{client.phone}</p>
                        <p className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]">{client.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs font-black text-slate-700">{client.city}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{client.address || '---'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-sm font-black text-slate-900 font-mono tracking-tighter">{totalSpent.toLocaleString()} <span className="text-[10px] text-slate-400">DH</span></p>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{width: `${returnProb}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <a href={`tel:${client.phone}`} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><Phone size={16} /></a>
                        <button onClick={() => { setEditingClient(client); setFormData({...client}); setShowForm(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={16} /></button>
                        <button onClick={(e) => handleDeleteClient(client.id, e)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center opacity-30">
                    <Users size={64} className="mx-auto mb-4 text-slate-200" />
                    <p className="font-black text-xl uppercase tracking-widest text-slate-300">لا يوجد نتائج للبحث</p>
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
             
             <form onSubmit={handleSubmit} className="p-12 space-y-8 max-h-[70vh] overflow-y-auto" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Section 1: Request Type */}
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest mr-2">نوع الطلب</label>
                      <div className="flex gap-4 p-2 bg-slate-50 border border-slate-100 rounded-[2rem]">
                         {['Individual', 'Company'].map(type => (
                            <button 
                               key={type}
                               type="button"
                               onClick={() => setFormData({...formData, clientType: type as ClientType})}
                               className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs transition-all flex items-center justify-center gap-3 ${formData.clientType === type ? 'bg-white shadow-xl text-blue-600 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                               {type === 'Individual' ? <User size={18} /> : <Building2 size={18} />}
                               {type === 'Individual' ? 'زبون عادي' : 'شركة'}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Section 2: Regular Customer Info */}
                   {formData.clientType === 'Individual' && (
                     <>
                       <div className="md:col-span-2 space-y-4 animate-in slide-in-from-right-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الاسم الكامل (إجباري)</label>
                          <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" placeholder="أدخل الاسم الكامل هنا..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="space-y-4 animate-in slide-in-from-right-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم الهاتف (إجباري)</label>
                          <input required type="tel" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner text-left" placeholder="+212 6..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                       </div>
                       <div className="space-y-4 animate-in slide-in-from-right-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المدينة (إجباري)</label>
                          <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                       </div>
                       <div className="md:col-span-2 space-y-4 animate-in slide-in-from-right-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نوع الخدمة</label>
                          <select 
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                            value={formData.serviceCategory}
                            onChange={e => setFormData({...formData, serviceCategory: e.target.value as any})}
                          >
                             <option value="صيانة الأجهزة">صيانة الأجهزة</option>
                             <option value="الشبكات والكاميرات">الشبكات والكاميرات</option>
                             <option value="أنظمة الإنذار">أنظمة الإنذار</option>
                             <option value="خدمات أخرى">خدمات أخرى</option>
                          </select>
                       </div>
                       <div className="md:col-span-2 space-y-4 animate-in slide-in-from-right-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">وصف المشكلة (إجباري)</label>
                          <textarea required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner min-h-[120px]" placeholder="اشرح المشكلة بالتفصيل..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                       </div>
                     </>
                   )}

                   {/* Section 3: Company Info */}
                   {formData.clientType === 'Company' && (
                     <>
                       <div className="md:col-span-2 space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم الشركة (إجباري)</label>
                          <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" placeholder="أدخل اسم الشركة هنا..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم المسؤول (إجباري)</label>
                          <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" placeholder="أدخل اسم المسؤول هنا..." value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} />
                       </div>
                       <div className="space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم الهاتف (إجباري)</label>
                          <input required type="tel" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner text-left" placeholder="+212 6..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                       </div>
                       <div className="space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">البريد الإلكتروني (إجباري)</label>
                          <input required type="email" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner text-left" placeholder="company@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                       </div>
                       <div className="space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المدينة (إجباري)</label>
                          <input required className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                       </div>
                       <div className="space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نوع الخدمة</label>
                          <select 
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                            value={formData.serviceCategory}
                            onChange={e => setFormData({...formData, serviceCategory: e.target.value as any})}
                          >
                             <option value="صيانة الأجهزة">صيانة الأجهزة</option>
                             <option value="الشبكات والكاميرات">الشبكات والكاميرات</option>
                             <option value="أنظمة الإنذار">أنظمة الإنذار</option>
                             <option value="خدمات أخرى">خدمات أخرى</option>
                          </select>
                       </div>
                       <div className="md:col-span-2 space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">حجم الخدمة</label>
                          <select 
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                            value={formData.serviceSize}
                            onChange={e => setFormData({...formData, serviceSize: e.target.value as any})}
                          >
                             <option value="صغير">صغير</option>
                             <option value="متوسط">متوسط</option>
                             <option value="كبير">كبير</option>
                          </select>
                       </div>
                       <div className="md:col-span-2 space-y-4 animate-in slide-in-from-left-4">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">وصف الطلب</label>
                          <textarea className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner min-h-[120px]" placeholder="اشرح تفاصيل الطلب هنا..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                       </div>
                     </>
                   )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 bg-[#0f172a] text-white font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all uppercase tracking-widest text-xs active:scale-95">
                     <Save size={24} /> {editingClient ? 'تحديث السجلات التقنية' : 'تثبيت الشريك في قاعدة البيانات'}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-[2rem] transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    إعادة تعيين
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
