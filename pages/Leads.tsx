
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Lead, LeadStatus, MarketingChannel, Client } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Trash2, Edit2, UserPlus, Phone, Target, Megaphone, 
  ArrowRightLeft, MessageCircle, TrendingUp, Filter, Activity,
  Zap, Facebook, Instagram, Globe, MoreHorizontal, CheckCircle2,
  Save, RefreshCw, Loader2, X, LayoutGrid, List, ChevronRight,
  AlertCircle, Calendar, MapPin, Mail, BarChart3, PieChart,
  ArrowUpRight, Clock, Hash
} from 'lucide-react';
import { ApiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

interface LeadsPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

type ViewMode = 'table' | 'kanban';

const LeadsPage: React.FC<LeadsPageProps> = ({ state, updateState, onNavigate }) => {
  const { user: authUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showForm, setShowForm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'createdAt'>>({
    name: '',
    phone: '',
    interest: '',
    source: 'Direct',
    status: 'New',
    priority: 'NORMAL',
    category: 'General',
    notes: [],
    campaignId: '',
    conversionProbability: 50,
    clientType: 'Individual',
    managerName: '',
    serviceSize: 'صغير',
    description: '',
    city: '',
    email: ''
  });

  const channels: MarketingChannel[] = ['Facebook', 'Instagram', 'WhatsApp', 'Referral', 'TikTok', 'Direct', 'Website', 'Google Ads'];
  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const total = state.leads.length;
    const converted = state.leads.filter(l => l.status === 'Converted').length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    const topSource = channels.reduce((prev, curr) => {
      const count = state.leads.filter(l => l.source === curr).length;
      return count > (state.leads.filter(l => l.source === prev).length || 0) ? curr : prev;
    }, 'Direct');

    return { total, converted, conversionRate, topSource };
  }, [state.leads]);

  const convertToClient = (lead: Lead) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      city: lead.city || '',
      address: '',
      lat: 0,
      lng: 0,
      clientType: lead.clientType || 'Individual',
      managerName: lead.managerName || '',
      serviceSize: lead.serviceSize || 'صغير',
      description: lead.description || lead.interest,
      status: 'جديد',
      serviceCategory: lead.interest as any || 'صيانة الأجهزة',
      companyId: authUser?.companyId || 'GIM-GLOBAL',
      deviceId: 'WEB-CLIENT',
      syncStatus: 'synced',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateState(prev => ({
      ...prev,
      clients: [newClient, ...prev.clients],
      leads: prev.leads.map(l => l.id === lead.id ? { ...l, status: 'Converted' as LeadStatus } : l)
    }));

    alert(`تم تحويل ${lead.name} إلى زبون رسمي بنجاح!`);
    onNavigate('clients');
  };

  const syncSocialLeads = async () => {
    setIsSyncing(true);
    try {
      const newLeads = await ApiService.leads.syncFromSocial();
      if (newLeads.length > 0) {
        updateState(prev => {
          const allLeads = [...newLeads, ...prev.leads];
          const seen = new Set();
          const uniqueLeads = allLeads.filter(l => {
            if (seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
          });
          return { ...prev, leads: uniqueLeads };
        });
        for (const lead of newLeads) {
          await ApiService.leads.deletePending(lead.id);
        }
        alert(`تمت مزامنة ${newLeads.length} فرصة جديدة بنجاح!`);
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    const checkPending = async () => {
      try {
        const resp = await fetch('/api/webhooks/pending');
        if (resp.ok) {
          const data = await resp.json();
          setPendingCount(data.length);
          if (data.length > 0 && !isSyncing) syncSocialLeads();
        }
      } catch (e) {}
    };
    checkPending();
    const interval = setInterval(checkPending, 15000);
    return () => clearInterval(interval);
  }, [isSyncing]);

  const deleteLead = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      updateState(prev => ({ ...prev, leads: prev.leads.filter(l => l.id === confirmDeleteId) }));
      setConfirmDeleteId(null);
    }
  };

  const updateLeadStatus = (id: string, newStatus: LeadStatus) => {
    updateState(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, status: newStatus } : l)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = { 
      ...formData, 
      id: editingLead?.id || crypto.randomUUID(), 
      createdAt: editingLead?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
      version: 1,
      companyId: authUser?.companyId || 'GIM-GLOBAL',
      deviceId: 'WEB-CLIENT'
    };
    
    updateState(prev => {
      const newLeads = editingLead 
        ? prev.leads.map(l => l.id === editingLead.id ? leadData as Lead : l)
        : [leadData as Lead, ...prev.leads];
      
      return {
        ...prev,
        leads: newLeads,
        automationLogs: [{
           id: crypto.randomUUID(),
           timestamp: new Date().toISOString(),
           username: authUser?.fullName || 'System',
           action: editingLead ? 'LEAD_UPDATED' : 'LEAD_ADDED',
           status: 'success',
           details: `${editingLead ? 'تحديث' : 'إضافة'} فرصة: ${leadData.name}`
        }, ...(prev.automationLogs || [])]
      };
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      name: '', phone: '', interest: '', source: 'Direct', status: 'New', 
      priority: 'NORMAL', category: 'General', notes: [], campaignId: '', 
      conversionProbability: 50, clientType: 'Individual', managerName: '',
      serviceSize: 'صغير', description: '', city: '', email: ''
    });
    setEditingLead(null);
    setShowForm(false);
  };

  const filteredLeads = useMemo(() => {
    return state.leads
      .filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
        const matchesSource = filterSource === 'All' || l.source === filterSource;
        return matchesSearch && matchesSource;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.leads, search, filterSource]);

  const getSourceIcon = (source: MarketingChannel) => {
    switch (source) {
      case 'Facebook': return <Facebook size={14} className="text-blue-600" />;
      case 'Instagram': return <Instagram size={14} className="text-pink-600" />;
      case 'WhatsApp': return <MessageCircle size={14} className="text-green-600" />;
      case 'Website': return <Globe size={14} className="text-indigo-600" />;
      case 'Google Ads': return <Target size={14} className="text-red-600" />;
      default: return <Hash size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#f8fafc] min-h-screen pb-24 text-right" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Target size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الفرص والنمو</h2>
          </div>
          <p className="text-slate-500 font-medium text-sm mr-13">تتبع وتحويل العملاء المحتملين من جميع القنوات</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${viewMode === 'kanban' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={16} /> لوحة كانبان
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={16} /> عرض الجدول
            </button>
          </div>

          <button 
            onClick={syncSocialLeads}
            disabled={isSyncing}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            مزامنة
            {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          </button>

          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Plus size={18} /> إضافة فرصة يدوية
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="إجمالي الفرص" value={stats.total} icon={<Target className="text-blue-500" />} trend="+12% هذا الشهر" />
        <StatCard label="تم تحويلهم" value={stats.converted} icon={<CheckCircle2 className="text-green-500" />} trend="زبائن رسميين" />
        <StatCard label="معدل التحويل" value={`${stats.conversionRate}%`} icon={<TrendingUp className="text-purple-500" />} trend="أداء ممتاز" />
        <StatCard label="أفضل مصدر" value={stats.topSource} icon={<Zap className="text-amber-500" />} trend="أعلى تفاعل" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو رقم الهاتف..." 
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            <option value="All">جميع المصادر</option>
            {channels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <AnimatePresence mode="wait">
        {viewMode === 'kanban' ? (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto pb-4 custom-scrollbar"
          >
            {statuses.map(status => (
              <KanbanColumn 
                key={status} 
                status={status} 
                leads={filteredLeads.filter(l => l.status === status)} 
                onEdit={setEditingLead}
                onDelete={deleteLead}
                onConvert={convertToClient}
                onStatusChange={updateLeadStatus}
                getSourceIcon={getSourceIcon}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest">المصدر / الزبون</th>
                    <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest">الاهتمام التقني</th>
                    <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest">المدينة</th>
                    <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">الاحتمالية</th>
                    <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">الحالة</th>
                    <th className="px-8 py-5 w-40 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                            {getSourceIcon(lead.source)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{lead.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{lead.interest}</span>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">{lead.city || '---'}</td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-black text-blue-600">{lead.conversionProbability}%</span>
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${lead.conversionProbability}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-8 py-5 text-left">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {lead.status !== 'Converted' && (
                            <button onClick={() => convertToClient(lead)} className="p-2 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all"><UserPlus size={16} /></button>
                          )}
                          <button onClick={() => setEditingLead(lead)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl"><Edit2 size={16} /></button>
                          <button onClick={() => deleteLead(lead.id)} className="p-2 text-slate-300 hover:text-red-600 bg-slate-50 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold">لم يتم العثور على أي فرص تطابق بحثك</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Form Modal */}
      {(showForm || editingLead) && (
        <LeadFormModal 
          lead={editingLead} 
          formData={formData} 
          setFormData={setFormData} 
          onSubmit={handleSubmit} 
          onClose={resetForm} 
          channels={channels}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="حذف الفرصة"
        message="هل أنت متأكد من حذف هذه الفرصة؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        confirmText="حذف نهائي"
      />
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ label, value, icon, trend }: { label: string, value: string | number, icon: React.ReactNode, trend: string }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trend}</span>
    </div>
    <h4 className="text-2xl font-black text-slate-900 mb-1">{value}</h4>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
  </div>
);

const StatusBadge = ({ status }: { status: LeadStatus }) => {
  const styles = {
    New: 'bg-blue-100 text-blue-700',
    Contacted: 'bg-amber-100 text-amber-700',
    Qualified: 'bg-purple-100 text-purple-700',
    Converted: 'bg-green-100 text-green-700',
    Lost: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const KanbanColumn = ({ status, leads, onEdit, onDelete, onConvert, onStatusChange, getSourceIcon }: any) => {
  const titles: any = { New: 'جديدة', Contacted: 'تم التواصل', Qualified: 'مؤهلة', Converted: 'تم التحويل', Lost: 'مفقودة' };
  const colors: any = { New: 'bg-blue-500', Contacted: 'bg-amber-500', Qualified: 'bg-purple-500', Converted: 'bg-green-500', Lost: 'bg-red-500' };

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colors[status]}`}></div>
          <h3 className="font-black text-slate-800 text-sm">{titles[status]}</h3>
          <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">{leads.length}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
      </div>

      <div className="flex-1 space-y-3 min-h-[500px] bg-slate-100/50 p-3 rounded-[2rem] border border-dashed border-slate-200">
        {leads.map((lead: Lead) => (
          <motion.div 
            layoutId={lead.id}
            key={lead.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 rounded-lg">{getSourceIcon(lead.source)}</div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lead.source}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${lead.priority === 'HIGH' ? 'bg-red-500 animate-pulse' : lead.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
            </div>

            <h4 className="font-black text-slate-800 text-sm mb-1">{lead.name}</h4>
            <p className="text-[10px] text-slate-500 font-bold mb-3 line-clamp-1">{lead.interest}</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">
                  {lead.conversionProbability}%
                </div>
              </div>
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${lead.conversionProbability}%` }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="flex gap-1">
                <button onClick={() => onEdit(lead)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                <button onClick={() => onDelete(lead.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
              </div>
              {status !== 'Converted' && (
                <button 
                  onClick={() => onConvert(lead)}
                  className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                >
                  <UserPlus size={12} /> تحويل
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const LeadFormModal = ({ lead, formData, setFormData, onSubmit, onClose, channels }: any) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden"
    >
      <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black tracking-tight">{lead ? 'تعديل الفرصة' : 'إضافة فرصة جديدة'}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">نظام إدارة الفرص الذكي</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button>
      </div>

      <form onSubmit={onSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-right">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">نوع الزبون</label>
            <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
              {['Individual', 'Company'].map(type => (
                <button 
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, clientType: type as any})}
                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${formData.clientType === type ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
                >
                  {type === 'Individual' ? 'زبون عادي' : 'شركة'}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">الاسم الكامل / اسم الشركة</label>
            <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">رقم الهاتف</label>
            <input required type="tel" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all text-left" placeholder="+212..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">المدينة</label>
            <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">الاهتمام التقني / نوع الخدمة</label>
            <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})}>
              <option value="">اختر الخدمة...</option>
              <option value="صيانة الأجهزة">صيانة الأجهزة</option>
              <option value="الشبكات والكاميرات">الشبكات والكاميرات</option>
              <option value="أنظمة الإنذار">أنظمة الإنذار</option>
              <option value="خدمات أخرى">خدمات أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">المصدر</label>
            <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value as any})}>
              {channels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">احتمالية التحويل (%)</label>
            <input type="number" min="0" max="100" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all" value={formData.conversionProbability} onChange={e => setFormData({...formData, conversionProbability: parseInt(e.target.value)})} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2">وصف الطلب / ملاحظات</label>
            <textarea className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
            <Save size={20} /> {lead ? 'تحديث البيانات' : 'حفظ الفرصة'}
          </button>
          <button type="button" onClick={onClose} className="px-8 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
        </div>
      </form>
    </motion.div>
  </div>
);

export default LeadsPage;
