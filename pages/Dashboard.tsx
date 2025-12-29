
import React from 'react';
import { AppState, DocType } from '../types';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const stats = [
    { label: 'إجمالي الزبناء', value: state.clients.length, icon: <Users className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'عروض الأثمان', value: state.documents.filter(d => d.type === DocType.DEVIS).length, icon: <FileText className="text-orange-600" />, color: 'bg-orange-50' },
    { label: 'الفواتير المصدرة', value: state.documents.filter(d => d.type === DocType.FACTURE).length, icon: <TrendingUp className="text-green-600" />, color: 'bg-green-50' },
    { label: 'عقود الصيانة', value: state.documents.filter(d => d.type === DocType.CONTRAT).length, icon: <CheckCircle className="text-purple-600" />, color: 'bg-purple-50' },
  ];

  const recentClients = state.clients.slice(-5).reverse();
  const recentDocs = state.documents.slice(-5).reverse();

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">مرحباً بك في نظام Electro GIM</h2>
          <p className="text-slate-400 max-w-md">أداة التسيير المتكاملة لشركة Electro GIM Services. قم بإدارة زبنائك وإصدار وثائقك القانونية بسهولة.</p>
          <div className="flex gap-4 mt-6">
            <button onClick={() => onNavigate('doc-form-devis')} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
              <Plus size={18} /> عرض ثمن جديد
            </button>
            <button onClick={() => onNavigate('clients')} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-bold transition-all">
              إضافة زبون
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Documents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">أحدث الوثائق</h3>
            <button onClick={() => onNavigate('devis')} className="text-blue-600 text-sm font-bold hover:underline">عرض الكل</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentDocs.length > 0 ? recentDocs.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                    doc.type === DocType.DEVIS ? 'bg-orange-100 text-orange-700' : 
                    doc.type === DocType.FACTURE ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {doc.type.substring(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{doc.number}</p>
                    <p className="text-xs text-slate-500">{doc.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">{doc.total.toFixed(2)} DH</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {doc.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 italic">لا توجد وثائق بعد.</div>
            )}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">أحدث الزبناء</h3>
            <button onClick={() => onNavigate('clients')} className="text-blue-600 text-sm font-bold hover:underline">عرض الكل</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentClients.length > 0 ? recentClients.map((client) => (
              <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{client.name}</p>
                    <p className="text-xs text-slate-500">ICE: {client.ice}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500">{client.city}</p>
                  <p className="text-xs font-medium text-slate-800">{client.phone}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 italic">لا يوجد زبناء بعد.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
