
import React from 'react';
import { ShieldCheck, Zap, MessageCircle, Facebook, Instagram, Phone, MapPin, Mail, ChevronLeft, Globe, Lock } from 'lucide-react';
import { CompanySettings } from '../types';

const LandingPage: React.FC<{ settings: CompanySettings }> = ({ settings }) => {
  return (
    <div className="min-h-screen bg-white font-arabic text-right selection:bg-blue-100" dir="rtl">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                 <ShieldCheck size={24} />
              </div>
              {/* Fix: Corrected property name from fullNameAE to fullName */}
              <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">{settings.fullName}</span>
           </div>
           <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
              <a href="#services" className="hover:text-blue-600 transition-colors">خدماتنا</a>
              <a href="#about" className="hover:text-blue-600 transition-colors">من نحن</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">اتصل بنا</a>
              <a href="#privacy" className="hover:text-blue-600 transition-colors">الخصوصية</a>
           </div>
           <a href={`https://wa.me/${settings.phone.replace(/\s+/g, '')}`} className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-black text-xs hover:bg-blue-600 transition-all flex items-center gap-2">
              طلب خدمة سريع <MessageCircle size={16} />
           </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                 <Zap size={14} className="fill-current" /> حلول تقنية متكاملة بالمغرب
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                 نؤمن منزلك، <br />
                 <span className="text-blue-600">ونبني مستقبلك الرقمي.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                 متخصصون في تركيب أنظمة الكاميرات الذكية، الشبكات المعلوماتية، وتطوير الحلول البرمجية للمقاولات الصغرى والمتوسطة.
              </p>
              <div className="flex flex-wrap gap-4">
                 <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3">
                    تصفح قائمة الخدمات <ChevronLeft size={20} />
                 </button>
                 <div className="flex -space-x-4 space-x-reverse items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-blue-600"><Facebook size={20} /></div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-pink-600"><Instagram size={20} /></div>
                    <div className="px-6 text-xs font-black text-slate-400">تابعنا على الشبكات</div>
                 </div>
              </div>
           </div>
           <div className="relative">
              <div className="aspect-square bg-blue-600 rounded-[4rem] rotate-3 shadow-2xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-slate-900/20"></div>
                 <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" alt="Tech" className="w-full h-full object-cover -rotate-3 scale-110" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-bounce duration-[3000ms]">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center"><ShieldCheck size={24} /></div>
                    <div>
                       <p className="text-xs font-black text-slate-400 uppercase">ضمان الخدمة</p>
                       <p className="text-lg font-black text-slate-900">100% موثوقية</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 bg-slate-50 px-6">
         <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">ماذا نقدم لزبنائنا؟</h2>
               <p className="text-slate-500 font-bold max-w-2xl mx-auto">نجمع بين الخبرة الميدانية في الأجهزة والذكاء البرمجي لنقدم حلولاً لا تضاهى.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { title: 'الأنظمة الأمنية', desc: 'تركيب كاميرات المراقبة المتطورة مع الربط بالهاتف الذكي.' },
                  { title: 'الشبكات والربط', desc: 'إعداد الشبكات المحلية LAN والواي فاي للمكاتب والمنازل.' },
                  { title: 'الحلول الرقمية', desc: 'برمجة واجهات ومواقع إلكترونية عصرية لتعزيز نشاطك.' }
               ].map((srv, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <Zap size={28} />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-4">{srv.title}</h3>
                     <p className="text-slate-500 font-bold leading-relaxed">{srv.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Compliance Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-20 mb-10">
            <div className="col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl"><Globe size={28} /></div>
                  {/* Fix: Corrected property name from fullNameAE to fullName */}
                  <span className="font-black text-2xl uppercase tracking-tighter">{settings.fullName}</span>
               </div>
               <p className="text-slate-400 font-bold max-w-sm leading-relaxed text-sm">
                  مقاول ذاتي مغربي معتمد، نقدم خدماتنا باحترافية عالية مع الالتزام التام بالقوانين الجاري بها العمل والشفافية في التعامل.
               </p>
            </div>
            <div className="space-y-6">
               <h4 className="text-xs font-black uppercase text-blue-500 tracking-[0.2em]">معلومات التواصل</h4>
               <div className="space-y-4 text-sm font-bold text-slate-300">
                  <div className="flex items-center gap-3"><Phone size={16} /> {settings.phone}</div>
                  <div className="flex items-center gap-3"><Mail size={16} /> {settings.email}</div>
                  <div className="flex items-center gap-3 text-right leading-relaxed"><MapPin size={16} className="shrink-0" /> {settings.address}</div>
               </div>
            </div>
            <div className="space-y-6">
               <h4 className="text-xs font-black uppercase text-blue-500 tracking-[0.2em]">الروابط القانونية</h4>
               <div className="flex flex-col gap-4 text-sm font-bold text-slate-300">
                  <a href="#privacy" className="hover:text-white transition-colors">سياسة الخصوصية</a>
                  <a href="#terms" className="hover:text-white transition-colors">شروط الاستخدام</a>
                  <div className="pt-4 flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase">
                     <Lock size={12} /> SSL Secure Connection
                  </div>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-50">
            {/* Fix: Corrected property name from fullNameAE to fullName */}
            <p className="text-xs font-black uppercase tracking-widest">© 2026 {settings.fullName} | All Rights Reserved</p>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase">
               <span>ICE: {settings.ice}</span>
               <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
               <span>N° AE: {settings.aeNumber}</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
