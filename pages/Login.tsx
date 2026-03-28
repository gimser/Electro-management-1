import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDB } from '../db';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { login, error, setError, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    // Simulate network delay for UX
    setTimeout(async () => {
      try {
        const db = await getDB();
        // Simple verification against local DB
        const foundUser = db.users.find(u => 
          u.username.toLowerCase() === username.toLowerCase()
        );

        if (foundUser) {
          // التحقق من كلمة المرور المسجلة
          if (foundUser.password === password) {
              login(foundUser);
          } else {
              setError('كلمة المرور غير صحيحة. يرجى التأكد من المفتاح السري.');
              setIsVerifying(false);
          }
        } else {
          setError('اسم المستخدم غير موجود في قاعدة بيانات النظام.');
          setIsVerifying(false);
        }
      } catch (err) {
        setError('فشل الاتصال بقاعدة البيانات المحلية. يرجى المحاولة مرة أخرى.');
        setIsVerifying(false);
      }
    }, 800);
  };

  const isLoading = isVerifying || authLoading;

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-arabic text-right" dir="rtl">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Right Side - Visual */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/30 shadow-lg">
                 <ShieldCheck size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-black mb-4 leading-tight">GIM SERVICES<br/>OPERATING SYSTEM</h1>
              <p className="text-blue-100 text-sm font-bold leading-relaxed max-w-sm">
                 نظام الإدارة المتكامل للمقاولات الذكية. تتبع المبيعات، الصيانة، والمخزون في منصة واحدة.
              </p>
           </div>
           
           <div className="relative z-10 text-[10px] font-black uppercase tracking-widest opacity-60">
              Enterprise Edition v2.5.0
           </div>

           {/* Decorative Circles */}
           <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
           <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Left Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-slate-50">
           <div className="max-w-sm w-full mx-auto space-y-8">
              <div>
                 <h2 className="text-2xl font-black text-slate-800 mb-2">تسجيل الدخول</h2>
                 <p className="text-slate-400 font-bold text-xs">يرجى إدخال بيانات الاعتماد للمتابعة</p>
              </div>

              {error && (
                 <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-black animate-in slide-in-from-top-2">
                    <AlertCircle size={16} /> {error}
                 </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1">اسم المستخدم</label>
                    <div className="relative">
                       <User className="absolute right-4 top-4 text-slate-400" size={20} />
                       <input 
                         type="text" 
                         required
                         className="w-full pr-12 pl-4 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:shadow-lg transition-all"
                         placeholder="admin"
                         value={username}
                         onChange={e => setUsername(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1">كلمة المرور</label>
                    <div className="relative">
                       <Lock className="absolute right-4 top-4 text-slate-400" size={20} />
                       <input 
                         type="password" 
                         required
                         className="w-full pr-12 pl-4 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:shadow-lg transition-all"
                         placeholder="••••••••"
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                       />
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={isLoading}
                   className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:scale-100"
                 >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>تسجيل الدخول <ArrowRight size={20} className="rotate-180" /></>}
                 </button>
              </form>

              <div className="text-center pt-4">
                 <p className="text-[10px] font-bold text-slate-400 mb-3">
                    نسيت كلمة المرور؟ <a href="#" className="text-blue-600 hover:underline">تواصل مع الدعم التقني</a>
                 </p>
                 <div className="p-4 bg-blue-50 rounded-2xl text-[10px] text-blue-800 font-bold border border-blue-100 inline-block w-full text-center">
                    <div className="mb-1">Admin: admin / 123</div>
                    <div className="text-blue-600">Tech: tech / 123</div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;