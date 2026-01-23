
import React, { useState, useEffect } from 'react';
import { AppState, Lead, LeadStatus, MarketingChannel, Client } from '../types';
import { 
  Plus, Search, Trash2, Edit2, UserPlus, Phone, Target, Megaphone, 
  ArrowRightLeft, MessageCircle, TrendingUp, Filter, Activity,
  Zap, Facebook, Instagram, Globe, MoreHorizontal, CheckCircle2,
  Save, RefreshCw, Loader2, X
} from 'lucide-react';
import { ApiService } from '../services/api';

interface LeadsPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const LeadsPage: React.FC<LeadsPageProps> = ({ state, updateState, onNavigate }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'createdAt'>>({
    name: '',
    phone: '',
    interest: '',
    source: 'Facebook',
    status: 'New',
    priority: 'NORMAL',
    category: 'General',
    notes: [],
    campaignId: '',
    conversionProbability: 50
  });

  const channels: MarketingChannel[] = ['Facebook', 'Instagram', 'WhatsApp', 'Referral', 'TikTok', 'Direct', 'Website', 'Google Ads'];

  const syncSocialLeads = async () => {
    setIsSyncing(true);
    const newLeads = await ApiService.leads.syncFromSocial();
    setIsSyncing(false);
    if (newLeads.length > 0) {
       updateState(prev => ({ ...prev, leads: [...newLeads, ...prev.leads] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = { ...formData, id: editingLead?.id || crypto.randomUUID(), createdAt: editingLead?.createdAt || new Date().toISOString() };
    
    if (editingLead) {
      updateState(prev => ({
        ...prev,
        leads: prev.leads.map(l => l.id === editingLead.id ? leadData : l)
      }));
    } else {
      updateState(prev => ({
        ...prev,
        leads: [...prev.leads, leadData as Lead],
        automationLogs: [{
           id: crypto.randomUUID(),
           timestamp: new Date().toISOString(),
           action: 'MANUAL_LEAD_ADDED',
           status: 'success',
           details: `تمت إضافة فرصة جديدة يدوياً: ${leadData.name}`
        }, ...(prev.automationLogs || [])]
      }));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', interest: '', source: 'Facebook', status: 'New', priority: 'NORMAL', category: 'General', notes: [], campaignId: '', conversionProbability: 50 });
    setEditingLead(null);
    setShowForm(false);
  };

  const filteredLeads = state.leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.phone.includes(search)
  );

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Target className="text-blue-600" size={32} /> صندوق الفرص الموحد (Omnichannel)
          </h2>
          <p className="text-slate-500 font-medium">استقبال الطلبات آلياً من WhatsApp, Facebook و Website</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={syncSocialLeads}
             disabled={isSyncing}
             className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
           >
             {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
             مزامنة الشبكات
           </button>
           <button 
             onClick={() => setShowForm(true)}
             className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl"
           >
             <Plus size={20} /> إضافة فرصة
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">المصدر / الزبون</th>
                <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">الاهتمام التقني</th>
                <th className="px-8 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-center">الحالة</th>
                <th className="px-8 py-4 w-40 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.slice().reverse().map((lead) => (
                <tr key={lead.id} className="hover:bg-blue-50/20 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                        {lead.source.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{lead.name}</p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{lead.interest}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      lead.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`tel:${lead.phone}`} className="p-2 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm">
                         <Phone size={18} />
                      </a>
                      <button onClick={() => setEditingLead(lead)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button>
                      <button className="p-2 text-slate-200 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;
