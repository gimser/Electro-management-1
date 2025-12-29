
import React, { useState } from 'react';
import { AppState, Client } from '../types';
import { Plus, Search, Trash2, Edit2, UserPlus, Phone, MapPin, Hash } from 'lucide-react';

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
    ice: '',
    phone: '',
    email: '',
    address: '',
    city: 'الدار البيضاء'
  });

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
        createdAt: new Date().toISOString()
      };
      updateState(prev => ({
        ...prev,
        clients: [...prev.clients, newClient]
      }));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', ice: '', phone: '', email: '', address: '', city: 'الدار البيضاء' });
    setEditingClient(null);
    setShowForm(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ 
      name: client.name, 
      ice: client.ice, 
      phone: client.phone, 
      email: client.email, 
      address: client.address, 
      city: client.city 
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الزبون؟ سيتم حذف جميع الوثائق المرتبطة به.')) {
      updateState(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id),
        documents: prev.documents.filter(d => d.clientId !== id)
      }));
    }
  };

  const filteredClients = state.clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.ice.includes(search) ||
    c.phone.includes(search)
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">قائمة الزبناء</h2>
          <p className="text-slate-500">إدارة قاعدة بيانات الشركات والزبناء</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <UserPlus size={18} /> زبون جديد
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث بالاسم، ICE، أو الهاتف..." 
              className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">الزبون</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">ICE</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">الهاتف</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">العنوان</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm text-left">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{client.ice}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{client.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{client.address}, {client.city}</td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(client)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">لا يوجد زبناء يطابقون البحث.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">{editingClient ? 'تعديل زبون' : 'إضافة زبون جديد'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><Plus size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">اسم الزبون / الشركة *</label>
                  <input 
                    required 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ICE (Identifiant Commun de l'Entreprise) *</label>
                  <input 
                    required 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    value={formData.ice}
                    onChange={(e) => setFormData({...formData, ice: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">الهاتف</label>
                    <input 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                    <input 
                      type="email"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">العنوان الكامل</label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">المدينة</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option value="الدار البيضاء">الدار البيضاء</option>
                    <option value="الرباط">الرباط</option>
                    <option value="مراكش">مراكش</option>
                    <option value="طنجة">طنجة</option>
                    <option value="فاس">فاس</option>
                    <option value="أكادير">أكادير</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all">
                  {editingClient ? 'حفظ التغييرات' : 'إضافة الزبون'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg transition-all">
                  إلغاء
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
