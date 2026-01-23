
import React, { useState } from 'react';
import { AppState, AppUser, UserRole, ActivityLog } from '../types';
import { 
  Users, Shield, ShieldAlert, UserPlus, Trash2, 
  Lock, Unlock, Eye, EyeOff, Activity, Search, 
  X, Save, CheckCircle2, UserCog, History, Edit2,
  Mail, Calendar, Fingerprint, ShieldCheck
} from 'lucide-react';

interface UserManagementProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [viewingUser, setViewingUser] = useState<AppUser | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  
  const [formData, setFormData] = useState<Omit<AppUser, 'id' | 'createdAt'>>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'Technician',
    status: 'Active'
  });

  const roles: UserRole[] = ['SuperAdmin', 'Manager', 'Supervisor', 'Technician', 'Marketing', 'Office'];

  const logAction = (action: string, details: string, severity: ActivityLog['severity'] = 'Info') => {
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      userId: 'system', 
      username: 'admin',
      action,
      module: 'USER_ADMIN',
      timestamp: new Date().toLocaleString('ar-MA'),
      details,
      severity
    };
    updateState(prev => ({
      ...prev,
      activityLogs: [newLog, ...(prev.activityLogs || [])]
    }));
  };

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: user.password || '',
      role: user.role,
      status: user.status
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // منطق التحديث
      updateState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u)
      }));
      logAction('UPDATE_USER', `تم تحديث بيانات المستخدم: ${formData.username} (${formData.role})`, 'Info');
    } else {
      // منطق الإضافة الجديدة
      const newUser: AppUser = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      updateState(prev => ({
        ...prev,
        users: [...prev.users, newUser]
      }));
      logAction('CREATE_USER', `تم إنشاء مستخدم جديد: ${newUser.username} بدور ${newUser.role}`, 'Info');
    }
    
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ username: '', fullName: '', email: '', password: '', role: 'Technician', status: 'Active' });
    setShowPassword(false);
    setEditingUser(null);
  };

  const toggleUserStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
    updateState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, status: newStatus } : u)
    }));
    logAction('TOGGLE_USER_STATUS', `تم ${newStatus === 'Active' ? 'تفعيل' : 'تعطيل'} حساب المستخدم: ${user.username}`, newStatus === 'Disabled' ? 'Warning' : 'Info');
  };

  const deleteUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const user = state.users.find(u => u.id === id);
    if (confirm(`هل أنت متأكد من حذف حساب "${user?.fullName}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      updateState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id)
      }));
      logAction('DELETE_USER', `تم حذف حساب المستخدم: ${user?.username}`, 'Critical');
    }
  };

  const filteredUsers = (state.users || []).filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Shield className="text-blue-600" size={32} /> إدارة الكادر البشري والأمن
          </h2>
          <p className="text-slate-500 font-medium">التحكم في هويات الولوج، تعديل الصلاحيات ومراقبة بروتوكولات الدخول</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
              >
                <Users size={16} /> الموظفين
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
              >
                <History size={16} /> سجل الأمان
              </button>
           </div>
           {activeTab === 'users' && (
              <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-8 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all">
                <UserPlus size={18} /> إضافة مستخدم
              </button>
           )}
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-6">
           <div className="relative max-w-xl">
              <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
              <input 
                className="w-full pr-12 pl-6 py-4 bg-white border border-slate-200 rounded-3xl font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                placeholder="ابحث بالاسم، اسم المستخدم أو البريد..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => setViewingUser(user)}
                  className={`bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer ${user.status === 'Disabled' && 'opacity-60'}`}
                >
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-lg uppercase group-hover:bg-blue-600 transition-colors">
                         {user.username.charAt(0)}
                      </div>
                      <div className="flex gap-2">
                         <button onClick={(e) => { e.stopPropagation(); handleEditClick(user); }} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm">
                            <Edit2 size={16} />
                         </button>
                         <button onClick={(e) => toggleUserStatus(user.id, e)} className={`p-2.5 rounded-xl border transition-all ${user.status === 'Active' ? 'text-green-600 bg-green-50 hover:bg-green-600 hover:text-white' : 'text-red-600 bg-red-50 hover:bg-red-600 hover:text-white'}`}>
                            {user.status === 'Active' ? <Unlock size={16} /> : <Lock size={16} />}
                         </button>
                         <button onClick={(e) => deleteUser(user.id, e)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                         <h3 className="text-xl font-black text-slate-800">{user.fullName}</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">@{user.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <ShieldCheck size={14} className="text-blue-500" />
                         <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{user.role}</span>
                      </div>
                      <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase">حالة الحساب</span>
                            <span className={`text-[10px] font-black ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{user.status === 'Active' ? 'مفعل ونشط' : 'معطل إدارياً'}</span>
                         </div>
                         <div className="text-left flex flex-col items-end">
                            <button className="text-[9px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1">عرض الملف <Eye size={10} /></button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl border-4 border-slate-800 min-h-[600px] flex flex-col relative overflow-hidden">
           <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 relative z-10">
              <h3 className="text-2xl font-black flex items-center gap-3"><Activity size={24} className="text-blue-400" /> سجل الرقابة والنشاطات الأمنية</h3>
              <div className="text-[10px] font-mono text-slate-500 tracking-widest">GIM-SEC-SHIELD-V2.5 &gt;_</div>
           </div>
           
           <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {state.activityLogs && state.activityLogs.length > 0 ? (
                state.activityLogs.map((log) => (
                  <div key={log.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl animate-in slide-in-from-bottom-2 flex gap-4 text-right">
                     <div className={`mt-1 ${log.severity === 'Critical' ? 'text-red-500' : log.severity === 'Warning' ? 'text-amber-500' : 'text-blue-400'}`}>
                        {log.severity === 'Critical' ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{log.action}</span>
                              <span className="text-[9px] text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">بواسطة: {log.username}</span>
                           </div>
                           <span className="text-[9px] text-slate-500 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-200">{log.details}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-30 py-20">
                   <Activity size={80} className="mb-4" />
                   <p className="font-black text-xl uppercase tracking-tighter">لا توجد سجلات أمان حالياً.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* مودال العرض (User Detail View) */}
      {viewingUser && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-right">
              <div className="relative h-32 bg-slate-900 overflow-hidden">
                 <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.2),transparent)]"></div>
                 <button onClick={() => setViewingUser(null)} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500 transition-all z-20"><X size={20}/></button>
              </div>
              <div className="px-10 pb-10 -mt-12 relative z-10">
                 <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white mb-6">
                    {viewingUser.username.charAt(0).toUpperCase()}
                 </div>
                 <div className="mb-8">
                    <h3 className="text-3xl font-black text-slate-900">{viewingUser.fullName}</h3>
                    <p className="text-slate-400 font-bold">معرف الدخول: @{viewingUser.username}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600"><Mail size={18}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">البريد الإلكتروني</p>
                          <p className="text-xs font-bold text-slate-800">{viewingUser.email}</p>
                       </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-600"><Fingerprint size={18}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">الدور الوظيفي</p>
                          <p className="text-xs font-bold text-slate-800">{viewingUser.role}</p>
                       </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600"><Calendar size={18}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">تاريخ الإنشاء</p>
                          <p className="text-xs font-bold text-slate-800">{new Date(viewingUser.createdAt).toLocaleDateString('ar-MA')}</p>
                       </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600"><Shield size={18}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">حالة الولوج</p>
                          <p className={`text-xs font-bold ${viewingUser.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{viewingUser.status === 'Active' ? 'مسموح بالدخول' : 'ممنوع من الولوج'}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => { setViewingUser(null); handleEditClick(viewingUser); }} className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                       <Edit2 size={18} /> تعديل البيانات
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* مودال الإضافة والتعديل (Add/Edit Form) */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-right">
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                       <UserCog size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{editingUser ? 'تعديل بيانات الحساب' : 'إنشاء حساب جديد'}</h3>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">GIM Access Protocol V2</p>
                    </div>
                 </div>
                 <button onClick={() => { setShowForm(false); resetForm(); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 transition-all">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">اسم المستخدم (Login)</label>
                       <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="yassine_gim" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">الاسم الكامل</label>
                       <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ياسين العلوي" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">كلمة المرور السرية</label>
                       <div className="relative">
                          <input 
                            required 
                            type={showPassword ? "text" : "password"} 
                            className="w-full px-5 py-3.5 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none pr-12" 
                            placeholder="••••••••" 
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                       </div>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">البريد الإلكتروني الرسمي</label>
                       <input type="email" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">الدور والصلاحيات (Role)</label>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {roles.map(r => (
                            <button key={r} type="button" onClick={() => setFormData({...formData, role: r})} className={`py-3 rounded-xl font-black text-[10px] border transition-all ${formData.role === r ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                               {r}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all uppercase tracking-[0.2em] text-xs mt-4">
                    <Save size={20} /> {editingUser ? 'تثبيت التغييرات الجديدة' : 'تثبيت الحساب في قاعدة البيانات'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
