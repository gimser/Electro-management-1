
import React, { useState } from 'react';
import { AppState, MarketingCampaign, MarketingChannel } from '../types';
import { 
  Megaphone, 
  Plus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Trash2, 
  Play, 
  Pause,
  Target,
  BarChart3
} from 'lucide-react';

interface CampaignsPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const CampaignsPage: React.FC<CampaignsPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<MarketingCampaign, 'id' | 'leadsCount' | 'conversionsCount'>>({
    name: '',
    platform: 'Facebook',
    status: 'Active',
    budget: 0,
    spent: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const platforms: MarketingChannel[] = ['Facebook', 'Instagram', 'WhatsApp', 'Website', 'Google Ads', 'TikTok'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampaign: MarketingCampaign = {
      ...formData,
      id: crypto.randomUUID(),
      leadsCount: 0,
      conversionsCount: 0
    };
    updateState(prev => ({
      ...prev,
      campaigns: [...(prev.campaigns || []), newCampaign]
    }));
    setShowForm(false);
  };

  const deleteCampaign = (id: string) => {
    if (confirm('هل تريد حذف هذه الحملة؟')) {
      updateState(prev => ({
        ...prev,
        campaigns: prev.campaigns.filter(c => c.id !== id)
      }));
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Megaphone className="text-purple-600" size={32} /> الحملات والإعلانات
          </h2>
          <p className="text-slate-500 font-medium">متابعة أداء الإعلانات وجلب الزبناء الجدد</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-purple-700 transition-all shadow-purple-100"
        >
          <Plus size={20} /> إطلاق حملة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(state.campaigns || []).map(campaign => {
          const roi = campaign.spent > 0 ? ((campaign.conversionsCount * 500) / campaign.spent).toFixed(1) : 0;
          return (
            <div key={campaign.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all group">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl">
                      <BarChart3 size={24} />
                   </div>
                   <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                        campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                         {campaign.status}
                      </span>
                      <button onClick={() => deleteCampaign(campaign.id)} className="text-slate-200 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-black text-slate-800 mb-1">{campaign.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{campaign.platform}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">الميزانية</p>
                      <p className="text-sm font-black text-slate-800">{campaign.budget} DH</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">تم صرفه</p>
                      <p className="text-sm font-black text-purple-600">{campaign.spent} DH</p>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2">
                      <Users size={14} className="text-blue-500" />
                      <span className="text-xs font-black text-slate-700">{campaign.leadsCount} Leads</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-xs font-black text-slate-700">ROI: {roi}x</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in">
             <div className="p-8 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-purple-900">إعداد حملة إعلانية</h3>
                <button onClick={() => setShowForm(false)} className="text-purple-400 hover:text-purple-900 transition-all">
                   <Plus size={32} className="rotate-45" />
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">اسم الحملة</label>
                      <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">المنصة</label>
                         <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value as MarketingChannel})}>
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">الميزانية (DH)</label>
                         <input type="number" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.budget} onChange={e => setFormData({...formData, budget: parseFloat(e.target.value)})} />
                      </div>
                   </div>
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">إطلاق الحملة</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
