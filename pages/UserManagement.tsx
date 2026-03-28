import React, { useState } from 'react';
import { AppState, AppUser, UserRole, Technician } from '../types';
import { 
  ShieldCheck, UserPlus, Users, Fingerprint, Trash2, Edit2, X, Save, Lock, Key, Copy, Eye, EyeOff, 
  CheckCircle2, AlertTriangle, Phone, Wrench, Briefcase, BadgeCheck, User
} from 'lucide-react';
import { createRecord } from '../db';
import { useAuth } from '../context/AuthContext';

interface UserManagementProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ state, updateState }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [selectedCredentials, setSelectedCredentials] = useState<AppUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'Technician' as UserRole,
    password: '', 
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
  };

  const handleFullNameChange = (name: string) => {
    setFormData(prev => {
      const newData = { ...prev, fullName: name };
      // Auto-generate username if it's empty or was previously auto-generated
      const suggestedUsername = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '.')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      if (!prev.username || prev.username === prev.fullName.toLowerCase().trim().replace(/\s+/g, '.')) {
        newData.username = suggestedUsername;
      }
      return newData;
    });
  };

  const roles: { role: UserRole; icon: any; color: string }[] = [
    { role: 'CEO', icon: ShieldCheck, color: 'text-slate-900' },
    { role: 'Manager', icon: Fingerprint, color: 'text-blue-600' },
    { role: 'Accountant', icon: Key, color: 'text-amber-600' },
    { role: 'Technician', icon: Wrench, color: 'text-purple-600' },
    { role: 'Sales', icon: Users, color: 'text-emerald-600' },
  ];

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'Technician',
      password: '',
    });
    setSaveStatus('idle');
    setPasswordStrength(0);
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      password: user.password || '',
    });
    setShowForm(true);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'CEO': return 'صلاحيات كاملة للنظام والتقارير المالية.';
      case 'Manager': return 'إدارة العمليات، الموظفين، والزبائن.';
      case 'Accountant': return 'إدارة الفواتير، المصاريف، والتقارير المحاسبية.';
      case 'Technician': return 'الوصول للمهام الميدانية، التدخلات التقنية، والـ Smart Home.';
      case 'Sales': return 'إدارة المبيعات (POS)، العروض، والزبائن.';
      default: return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.password) return alert('يرجى ملء كافة البيانات الحيوية للنظام');

    setSaveStatus('saving');

    // محاكاة تأخير بسيط لإعطاء شعور بالمعالجة
    setTimeout(() => {
        if (editingUser) {
            // تحديث مستخدم موجود
            const updatedUser = {
                ...editingUser,
                username: formData.username.trim(),
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                role: formData.role,
                password: formData.password
            };

            updateState(prev => ({
                ...prev,
                users: prev.users.map(u => u.id === editingUser.id ? updatedUser : u)
            }));

            // إذا كان المستخدم المعدل هو المستخدم الحالي، قم بتحديث السياق
            if (currentUser && currentUser.id === updatedUser.id) {
                updateUser(updatedUser);
            }
        } else {
            // 1. تكوين كائن المستخدم الجديد
            const newUser = createRecord<AppUser>({
              username: formData.username.trim(),
              fullName: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              role: formData.role,
              status: 'Active',
              password: formData.password 
            });

            // 2. تحديث الحالة المركزية (Core State Update)
            updateState(prev => {
              let technicians = [...prev.technicians];
              let logs = [...(prev.activityLogs || [])];
              
              // الذكاء التشغيلي: إنشاء ملف تقني تلقائياً
              if (formData.role === 'Technician') {
                const newTech = createRecord<Technician>({
                  name: formData.fullName,
                  phone: formData.phone.trim(),
                  specialty: (formData as any).specialty || 'Security & Networks',
                  status: 'Active',
                  joinDate: new Date().toISOString().split('T')[0],
                  maxDailyTasks: 5,
                  performanceRating: 100, // بداية ممتازة
                  bonusPoints: 0,
                  level: 1,
                  exp: 0,
                  badges: ['NEW_RECRUIT']
                });
                newTech.id = newUser.id; 

                technicians.push(newTech);
                
                logs.unshift(createRecord({
                    userId: currentUser?.id || 'system',
                    username: currentUser?.fullName || 'System',
                    action: 'AUTO_PROFILE_LINK',
                    module: 'HR',
                    timestamp: new Date().toISOString(),
                    details: `تم إنشاء ملف تقني ميداني تلقائياً للمستخدم: ${newUser.fullName}`,
                    severity: 'Info'
                }));
              }

              logs.unshift(createRecord({
                userId: currentUser?.id || 'system',
                username: currentUser?.fullName || 'System',
                action: 'USER_CREATED',
                module: 'HR',
                timestamp: new Date().toISOString(),
                details: `تم إضافة مستخدم جديد للنظام: ${newUser.fullName} (${newUser.role})`,
                severity: 'Info'
              }));

              return {
                ...prev,
                users: [...prev.users, newUser],
                technicians: technicians,
                activityLogs: logs
              };
            });
        }

        setSaveStatus('success');
        
        // إعادة التعيين بعد النجاح
        setTimeout(() => {
            setShowForm(false);
            setEditingUser(null);
            setFormData({ username: '', fullName: '', email: '', phone: '', role: 'Technician', password: '' });
            setSaveStatus('idle');
        }, 1500);
    }, 800);
  };

  const deleteUser = (id: string) => {
    if (confirm('تنبيه أمني: هل أنت متأكد من سحب صلاحيات هذا المستخدم؟')) {
      updateState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id),
        // ملاحظة: لا نحذف ملف التقني للحفاظ على سجل التدخلات التاريخي (Data Integrity)
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ البيانات للحافظة');
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 text-right font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                 <Users className="text-blue-600" size={28} /> مركز إدارة الهوية والصلاحيات
              </h2>
              <p className="text-slate-500 font-bold text-xs mt-1">التحكم المركزي في حسابات الموظفين وسجلات الدخول</p>
           </div>
           <button 
             onClick={() => setShowForm(true)}
             className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95 text-xs uppercase tracking-widest"
           >
              <UserPlus size={18} /> تسجيل موظف جديد
           </button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {state.users.map((user, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                 {/* Role Badge */}
                 <div className="absolute top-6 left-6">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest inline-flex items-center gap-1 ${user.role === 'CEO' ? 'bg-slate-900 text-white border-slate-900' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                        {user.role}
                    </span>
                 </div>

                 <div className="flex items-center gap-5 relative z-10 mt-2">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${user.role === 'CEO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                       {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-lg font-black text-slate-800 line-clamp-1">{user.fullName}</h3>
                       <p className="text-[10px] font-bold text-slate-400 font-mono">{user.email || 'No Email'}</p>
                       <p className="text-[9px] font-bold text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active Account</p>
                    </div>
                 </div>

                 <div className="flex justify-between mt-8 pt-6 border-t border-slate-50 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="text-[10px] font-bold text-slate-400">
                        Login: <span className="text-slate-800 font-mono">{user.username}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                           onClick={() => handleEdit(user)} 
                           className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors"
                           title="تعديل البيانات"
                        >
                           <Edit2 size={16} />
                        </button>
                        <button 
                           onClick={() => { setSelectedCredentials(user); setShowPassword(false); }} 
                           className="p-2 text-slate-400 hover:text-amber-500 bg-slate-50 rounded-xl hover:bg-amber-50 transition-colors"
                           title="كشف كلمة المرور"
                        >
                           <Key size={16} />
                        </button>
                        {user.role !== 'CEO' && (
                          <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-xl hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                        )}
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* Credentials Modal */}
        {selectedCredentials && (
           <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
              <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                 <div className="p-8 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-amber-700">
                       <div className="bg-white p-2 rounded-xl shadow-sm"><Lock size={20} /></div>
                       <div>
                           <h3 className="text-lg font-black">بيانات الدخول الآمنة</h3>
                           <p className="text-[10px] opacity-70">Top Secret Credentials</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedCredentials(null)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 transition-all">
                       <X size={18} />
                    </button>
                 </div>
                 <div className="p-10 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم المستخدم (Login)</label>
                       <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <span className="flex-1 font-black font-mono text-lg text-slate-800">{selectedCredentials.username}</span>
                          <button onClick={() => copyToClipboard(selectedCredentials.username)} className="text-slate-400 hover:text-blue-600"><Copy size={16}/></button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كلمة المرور (Access Key)</label>
                       <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <span className="flex-1 font-black font-mono text-lg text-slate-800 tracking-wider">
                             {showPassword ? (selectedCredentials.password || 'غير محددة') : '••••••••••••'}
                          </span>
                          <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-blue-600">
                             {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                          <button onClick={() => copyToClipboard(selectedCredentials.password || '')} className="text-slate-400 hover:text-blue-600"><Copy size={16}/></button>
                       </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                        <AlertTriangle size={20} className="text-blue-600 shrink-0" />
                        <p className="text-[10px] font-bold text-blue-800 leading-relaxed">
                           يرجى مشاركة هذه البيانات مع الموظف المعني عبر قناة آمنة. النظام يقوم بحفظ البيانات محلياً ومشفرة لضمان الخصوصية.
                        </p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Add User Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
             <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-8">
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-black text-slate-800">{editingUser ? 'تعديل بيانات العضو' : 'إضافة عضو للفريق'}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">System Enrollment Protocol</p>
                   </div>
                   <button onClick={() => { setShowForm(false); setEditingUser(null); }} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 transition-all">
                      <X size={24} />
                   </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                   {/* Section 1: Personal Info */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                         <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">01</div>
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">المعلومات الشخصية</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الاسم الكامل</label>
                            <div className="relative">
                               <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                               <input 
                               required 
                               className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                               placeholder="مثال: أحمد العلمي" 
                               value={formData.fullName} 
                               onChange={e => handleFullNameChange(e.target.value)} 
                             />
                            </div>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">البريد الإلكتروني</label>
                            <input type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-left transition-all" placeholder="email@gim.ma" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">رقم الهاتف</label>
                            <div className="relative">
                               <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                               <input className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-left transition-all" placeholder="06XXXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Section 2: Account Security */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                         <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-black text-xs">02</div>
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">أمان الحساب</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">اسم المستخدم (Login)</label>
                            <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ahmed.alami" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2 flex items-center justify-between">
                               <span>كلمة المرور</span>
                               <div className="flex gap-2">
                                  <button type="button" onClick={() => copyToClipboard(formData.password)} className="text-slate-400 hover:text-blue-600 lowercase font-bold flex items-center gap-1">
                                     <Copy size={12} /> نسخ
                                  </button>
                                  <button type="button" onClick={generatePassword} className="text-blue-600 hover:underline lowercase font-bold">توليد تلقائي</button>
                               </div>
                            </label>
                            <div className="relative">
                               <input 
                                 type={showPassword ? "text" : "password"} 
                                 required 
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-left transition-all pr-12" 
                                 placeholder="••••••••" 
                                 value={formData.password} 
                                 onChange={e => {
                                   setFormData({...formData, password: e.target.value});
                                   calculatePasswordStrength(e.target.value);
                                 }} 
                               />
                               <button 
                                 type="button" 
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                               >
                                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                               </button>
                            </div>
                            {formData.password && (
                               <div className="mt-2 space-y-1 px-2">
                                 <div className="flex gap-1">
                                   {[1, 2, 3, 4, 5].map((step) => (
                                     <div 
                                       key={step} 
                                       className={`h-1 flex-1 rounded-full transition-all ${
                                         passwordStrength >= step 
                                           ? passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 4 ? 'bg-amber-500' : 'bg-green-500'
                                           : 'bg-slate-200'
                                       }`}
                                     />
                                   ))}
                                 </div>
                                 <p className={`text-[9px] font-bold ${
                                   passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 4 ? 'text-amber-500' : 'text-green-500'
                                 }`}>
                                   {passwordStrength <= 2 ? 'كلمة مرور ضعيفة' : passwordStrength <= 4 ? 'كلمة مرور متوسطة' : 'كلمة مرور قوية جداً'}
                                 </p>
                               </div>
                             )}
                         </div>
                      </div>
                   </div>

                   {/* Section 3: Access Level */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                         <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-black text-xs">03</div>
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">مستوى الوصول (الصلاحيات)</h4>
                      </div>
                      <div className="space-y-4">
                         <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-2">الدور الوظيفي</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {roles.map(({ role: r, icon: Icon, color }) => (
                               <button
                                 key={r}
                                 type="button"
                                 onClick={() => setFormData({...formData, role: r})}
                                 className={`p-4 rounded-2xl border-2 text-right transition-all group relative overflow-hidden ${formData.role === r ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200 bg-white'}`}
                               >
                                  <div className="flex items-center justify-between mb-2">
                                     <div className={`p-2 rounded-xl ${formData.role === r ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50'}`}>
                                        <Icon size={18} />
                                     </div>
                                     {formData.role === r && <CheckCircle2 size={16} className="text-blue-600" />}
                                  </div>
                                  <span className={`text-xs font-black block mb-1 ${formData.role === r ? 'text-blue-700' : 'text-slate-700'}`}>{r}</span>
                                  <p className={`text-[9px] font-bold leading-relaxed ${formData.role === r ? 'text-blue-600/70' : 'text-slate-400'}`}>
                                     {getRoleDescription(r)}
                                  </p>
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   {formData.role === 'Technician' && (
                       <div className="space-y-6 animate-in slide-in-from-top-2">
                           <div className="bg-blue-50 p-5 rounded-3xl flex flex-col gap-4 border border-blue-100">
                               <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                      <ShieldCheck className="text-blue-600" size={24} />
                                   </div>
                                   <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
                                       <span className="block text-xs font-black mb-0.5">ملاحظة تقنية:</span>
                                       سيتم إنشاء ملف تعريف "تقني ميداني" تلقائياً لهذا المستخدم للظهور في جدول المهام والتدخلات.
                                   </p>
                               </div>
                               
                               <div className="space-y-2">
                                   <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mr-2">تخصص التقني</label>
                                   <select 
                                       className="w-full px-6 py-3 bg-white border border-blue-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                       value={(formData as any).specialty || 'Security & Networks'}
                                       onChange={e => setFormData({...formData, specialty: e.target.value} as any)}
                                   >
                                       <option value="Security & Networks">Security & Networks</option>
                                       <option value="Web & Apps">Web & Apps</option>
                                       <option value="Smart Home">Smart Home</option>
                                       <option value="GIM Store">GIM Store</option>
                                       <option value="Consulting">Consulting</option>
                                       <option value="Cyber Security">Cyber Security</option>
                                   </select>
                               </div>
                           </div>
                       </div>
                   )}

                   <div className="flex gap-4">
                     <button 
                       type="submit" 
                       disabled={saveStatus !== 'idle'}
                       className={`flex-1 text-white font-black py-6 rounded-[2.5rem] shadow-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 ${saveStatus === 'success' ? 'bg-green-600' : 'bg-slate-900 hover:bg-blue-600'}`}
                     >
                        {saveStatus === 'success' ? (
                            <> <CheckCircle2 size={20} /> {editingUser ? 'تم تحديث البيانات بنجاح' : 'تمت إضافة المستخدم بنجاح'} </>
                        ) : saveStatus === 'saving' ? (
                            <> جاري الحفظ في النظام... </>
                        ) : (
                            <> <Save size={20} /> {editingUser ? 'حفظ التغييرات' : 'حفظ وإنشاء الحساب'} </>
                        )}
                     </button>

                     <button 
                       type="button"
                       onClick={resetForm}
                       className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-[2.5rem] transition-all flex items-center justify-center gap-2 text-xs"
                     >
                       إعادة تعيين
                     </button>
                   </div>
                </form>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserManagement;
