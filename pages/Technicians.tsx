
import React, { useState } from 'react';
import { AppState, Technician, GIMServiceCategory } from '../types';
import { 
  Plus, Search, Trash2, Edit2, HardHat, CheckCircle, 
  AlertTriangle, Activity, Brain, ShieldAlert, X, 
  Save, Phone, Star, TrendingUp, BarChart3, Clock,
  Award, Zap, UserCheck, Trophy, Crown, Medal, 
  ChevronRight, Sparkles, Target, Flame, Skull
} from 'lucide-react';

interface TechniciansPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const TechniciansPage: React.FC<TechniciansPageProps> = ({ state, updateState }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [selectedTechHistory, setSelectedTechHistory] = useState<Technician | null>(null);
  
  const [formData, setFormData] = useState<Omit<Technician, 'id' | 'joinDate'>>({
    name: '',
    phone: '',
    specialty: 'Security & Networks',
    status: 'Active',
    maxDailyTasks: 5,
    performanceRating: 85,
    bonusPoints: 0,
    level: 1,
    exp: 0,
    badges: []
  });

  const getLevelLabel = (level: number = 1) => {
    if (level >= 10) return { label: 'GIM Legend', color: 'text-purple-600', icon: <Crown size={14}/> };
    if (level >= 5) return { label: 'Elite Pro', color: 'text-amber-600', icon: <Medal size={14}/> };
    if (level >= 2) return { label: 'Master Tech', color: 'text-blue-600', icon: <Award size={14}/> };
    return { label: 'Rookie Tech', color: 'text-slate-500', icon: <HardHat size={14}/> };
  };

  const handleDeleteAllTechs = async () => {
    if (state.technicians.length === 0) return;
    
    if (window.confirm('🚨 تحذير: هل أنت متأكد من حذف جميع الفنيين (Technicians)؟')) {
      const confirmCode = Math.floor(1000 + Math.random() * 9000).toString();
      const userInput = window.prompt(`لتأكيد الحذف النهائي لـ ${state.technicians.length} فني، يرجى إدخال الرمز التالي: ${confirmCode}`);
      
      if (userInput === confirmCode) {
        updateState(prev => ({
          ...prev,
          technicians: [],
          activityLogs: [{
            id: crypto.randomUUID(),
            userId: 'system',
            username: 'System',
            action: 'ALL_TECHNICIANS_REMOVED',
            module: 'HR',
            timestamp: new Date().toISOString(),
            details: `تم مسح جميع الفنيين من النظام (${state.technicians.length} سجل).`,
            severity: 'Warning'
          }, ...(prev.activityLogs || [])]
        }));
        alert('تم حذف جميع الفنيين بنجاح.');
      }
    }
  };

  const deleteTech = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفني؟')) {
      updateState(prev => ({
        ...prev,
        technicians: prev.technicians.filter(t => t.id !== id)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTech) {
      updateState(prev => ({
        ...prev,
        technicians: prev.technicians.map(t => t.id === editingTech.id ? { ...t, ...formData } : t)
      }));
    } else {
      const newTech: Technician = {
        ...formData,
        id: crypto.randomUUID(),
        joinDate: new Date().toISOString().split('T')[0],
        bonusPoints: 0,
        level: 1,
        exp: 0,
        badges: ['NEW_RECRUIT'],
        xpHistory: []
      };
      updateState(prev => ({
        ...prev,
        technicians: [...prev.technicians, newTech]
      }));
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTech(null);
    setFormData({ name: '', phone: '', specialty: 'Security & Networks', status: 'Active', maxDailyTasks: 5, performanceRating: 85, bonusPoints: 0, level: 1, exp: 0, badges: [] });
  };

  const getTechInsights = (tech: Technician) => {
    const tasks = state.tasks.filter(t => t.technician === tech.name);
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const active = tasks.filter(t => t.status !== 'Completed').length;
    const loadLevel = active >= tech.maxDailyTasks ? 'Overloaded' : active >= tech.maxDailyTasks * 0.7 ? 'High' : 'Normal';
    const rating = tech.performanceRating || (completed > 0 ? 88 : 0);
    const bonusPoints = tech.bonusPoints || 0;
    const level = tech.level || 1;
    const exp = tech.exp || 0;
    const nextLevelExp = level * 1000; // Updated scale
    const expPercent = Math.min(100, (exp / nextLevelExp) * 100);
    
    return { completed, active, loadLevel, rating, bonusPoints, level, exp, expPercent, nextLevelExp };
  };

  const filteredTechs = state.technicians.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-in fade-in duration-500 pb-24 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Trophy className="text-amber-500" size={32} /> حائط الأبطال (RPG Progression)
          </h2>
          <p className="text-slate-500 font-medium">مراقبة الأداء القتالي الميداني، المستويات، ونظام المكافآت</p>
        </div>
        <div className="flex gap-4">
           <button onClick={handleDeleteAllTechs} className="bg-red-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-red-500 transition-all active:scale-95">
             <Trash2 size={20} /> حذف الكل
           </button>
           <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95">
             <Plus size={20} /> إضافة بطل جديد
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTechs.map((tech) => {
          const { completed, active, loadLevel, rating, bonusPoints, level, expPercent, nextLevelExp } = getTechInsights(tech);
          const levelInfo = getLevelLabel(level);
          
          return (
            <div key={tech.id} className="relative group">
               {/* Glowing effect for high levels */}
               {level >= 5 && <div className="absolute inset-0 bg-amber-400/20 blur-[40px] rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>}
               
               <div className={`bg-white rounded-[3rem] border-4 p-8 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden flex flex-col h-full ${level >= 10 ? 'border-purple-200' : level >= 5 ? 'border-amber-200' : 'border-slate-100'}`}>
                  
                  {/* Badge Section */}
                  <div className="flex justify-between items-start mb-6 pt-2">
                     <div className="relative">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-xl transition-all relative z-10 ${level >= 10 ? 'bg-purple-600 text-white' : level >= 5 ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white'}`}>
                           {tech.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full border-4 border-slate-50 flex items-center justify-center shadow-lg z-20">
                           <span className="text-xs font-black text-slate-800">Lvl {level}</span>
                        </div>
                     </div>

                     <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-black text-[10px] uppercase tracking-widest ${levelInfo.color} bg-slate-50`}>
                           {levelInfo.icon}
                           {levelInfo.label}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                           <Star size={12} className="fill-amber-500" />
                           <span className="text-xs font-black">{rating}% Score</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 flex-1">
                     <div>
                        <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{tech.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Target size={12} className="text-blue-500" /> Specialist: {tech.specialty}
                        </p>
                     </div>

                     {/* Experience Bar (XP) */}
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span className="text-slate-400">Experience Points (EXP)</span>
                           <span className="text-blue-600">{tech.exp} / {nextLevelExp}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                           <div className={`h-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)] ${level >= 5 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{width: `${expPercent}%`}}></div>
                        </div>
                     </div>

                     {/* Stats Matrix */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 group-hover:bg-white transition-colors">
                           <div className="flex items-center gap-2 mb-1">
                              <CheckCircle size={12} className="text-green-500" />
                              <span className="text-[9px] font-black text-slate-400 uppercase">Missions</span>
                           </div>
                           <p className="text-xl font-black text-slate-800">{completed}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 group-hover:bg-white transition-colors">
                           <div className="flex items-center gap-2 mb-1">
                              <Flame size={12} className="text-red-500" />
                              <span className="text-[9px] font-black text-slate-400 uppercase">Current</span>
                           </div>
                           <p className="text-xl font-black text-slate-800">{active}</p>
                        </div>
                     </div>

                     {/* Reward Pool */}
                     <div className="bg-blue-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                           <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                              <Crown size={12} className="text-amber-400" /> Bonus Progress
                           </p>
                           <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black">{bonusPoints}</span>
                              <span className="text-xs text-blue-200">/ 100 PTS</span>
                           </div>
                        </div>
                        <Sparkles size={100} className="absolute -left-10 -bottom-10 text-white/5 rotate-12" />
                     </div>
                  </div>

                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50">
                     <div className="flex gap-2">
                        <button onClick={() => { setEditingTech(tech); setFormData({...tech}); setShowForm(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm">
                           <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteTech(tech.id)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
                           <Trash2 size={16} />
                        </button>
                     </div>
                     <button onClick={() => setSelectedTechHistory(tech)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-2 group/btn">
                        سجل النقاط <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      {selectedTechHistory && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
              <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                  <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                      <div>
                          <h3 className="text-xl font-black">{selectedTechHistory.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP Log & Performance</p>
                      </div>
                      <button onClick={() => setSelectedTechHistory(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all"><X size={20}/></button>
                  </div>
                  <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                      {selectedTechHistory.xpHistory?.length ? selectedTechHistory.xpHistory.map((entry, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl border flex justify-between items-center ${entry.type === 'GAIN' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                              <div>
                                  <p className="text-xs font-black text-slate-800">{entry.reason}</p>
                                  <p className="text-[9px] text-slate-400">{new Date(entry.date).toLocaleString()}</p>
                              </div>
                              <span className={`font-black font-mono text-lg ${entry.type === 'GAIN' ? 'text-green-600' : 'text-red-600'}`}>
                                  {entry.type === 'GAIN' ? '+' : ''}{entry.amount} XP
                              </span>
                          </div>
                      )) : (
                          <div className="text-center text-slate-400 py-10 font-bold text-xs">لا يوجد سجل نقاط حتى الآن</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Existing Form Modal... (Code omitted for brevity as it remains similar but ensures XP history init) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-right">
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{editingTech ? 'تحديث ملف البطل' : 'استقطاب موهبة تقنية جديدة'}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">GIM Hero Recruitment Portal</p>
                 </div>
                 <button onClick={resetForm} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-600 transition-all">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">الاسم الكامل</label>
                       <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" placeholder="ياسين المودن" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">تخصص البطولة</label>
                       <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value as GIMServiceCategory})}>
                          <option value="Security & Networks">الكاميرات والشبكات</option>
                          <option value="Web & Apps">المواقع والتطبيقات</option>
                          <option value="Smart Home">البيت الذكي</option>
                          <option value="GIM Store">متجر GIM</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest mr-2">رقم التواصل</label>
                       <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-inner text-left" placeholder="06XXXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px] mt-4">
                    <Save size={18} /> {editingTech ? 'حفظ التعديلات' : 'تثبيت البطل في النظام'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansPage;
