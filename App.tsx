
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, LayoutDashboard, Settings as SettingsIcon, Calendar, 
  ChevronLeft, Menu, Package, HardHat, Zap, 
  LifeBuoy, Tag, Clock, CalendarDays, Box, FileText,
  Megaphone, Share2, Target, ChevronDown, 
  Wallet, Activity, Cpu, Shield,
  Navigation2, Landmark, Brain, Scale, LogOut, User as UserIcon,
  Fingerprint, Lock, Eye, EyeOff, ShieldCheck, Rocket, ShieldAlert,
  Stethoscope, MessageSquare, Award, ShoppingCart, Banknote,
  Home, ListChecks, Briefcase, ThumbsUp, Search, Bell, Grid, UserCheck,
  ClipboardList, UserMinus, ShieldQuestion, FileSignature, Receipt,
  History, UserCog, Gavel, Archive, TrendingUp, Power, ShoppingBag, Truck
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getDB, saveDB } from './db';
import { AppState, DocType, Document, UserRole } from './types';

// استيراد الصفحات
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import CustomerIssuesPage from './pages/CustomerIssues';
import TechniciansPage from './pages/Technicians';
import TechSchedulePage from './pages/TechSchedule';
import PricingPage from './pages/Pricing';
import CustomerWorkSchedulePage from './pages/CustomerWorkSchedule';
import DocumentList from './pages/DocumentList';
import DocumentForm from './pages/DocumentForm';
import SettingsPage from './pages/Settings';
import SchedulerPage from './pages/Scheduler';
import MarketingPage from './pages/Marketing';
import CampaignsPage from './pages/Campaigns';
import SocialMediaSettings from './pages/SocialMediaSettings';
import InventoryPage from './pages/Inventory';
import TechnicalAnalysis from './pages/TechnicalAnalysis';
import LeadsPage from './pages/Leads';
import ExpensesPage from './pages/Expenses';
import AutomationPage from './pages/Automation';
import VisitsPage from './pages/Visits';
import FinanceControl from './pages/FinanceControl';
import PrintView from './components/PrintView';
import UserManagement from './pages/UserManagement';
import GimAIPage from './pages/GimAI';
import LegalManagement from './pages/LegalManagement';
import WarrantiesPage from './pages/Warranties';
import ProductDevisBuilder from './pages/ProductDevisBuilder';
import ClientDecision from './pages/ClientDecision';
import PurchaseInvoices from './pages/PurchaseInvoices';

const AppContent: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [state, setState] = useState<AppState>(getDB());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [printingDoc, setPrintingDoc] = useState<Document | null>(null);
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const isTechnician = user?.role === 'Technician';

  // تحديد الصلاحيات بناءً على رتبة المستخدم (Role-Based Access Control)
  const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    'SuperAdmin': ['*'],
    'Manager': ['*'],
    'Technician': ['dashboard', 'visits', 'technical-analysis', 'client-decision'],
    'Office': ['dashboard', 'clients', 'devis', 'invoices', 'purchase-invoices', 'leads', 'finance', 'expenses', 'customer-issues', 'warranties', 'product-devis-builder', 'pricing', 'client-decision'],
    'Supervisor': ['dashboard', 'clients', 'customer-issues', 'visits', 'technical-analysis', 'scheduler', 'inventory', 'warranties', 'product-devis-builder', 'pricing', 'client-decision'],
    'Marketing': ['dashboard', 'leads', 'campaigns', 'automation', 'clients']
  };

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const nextState = updater(prev);
      const finalState: AppState = {
        ...nextState,
        clients: [...(nextState.clients || [])],
        documents: [...(nextState.documents || [])],
        inventory: [...(nextState.inventory || [])],
        servicePrices: [...(nextState.servicePrices || [])],
        expenses: [...(nextState.expenses || [])],
        users: [...(nextState.users || [])],
        tasks: [...(nextState.tasks || [])],
        customerIssues: [...(nextState.customerIssues || [])],
        visits: [...(nextState.visits || [])],
        automationLogs: [...(nextState.automationLogs || [])],
        activityLogs: [...(nextState.activityLogs || [])]
      };
      saveDB(finalState);
      return finalState;
    });
  }, []);

  const canAccess = (tabId: string) => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[user.role];
    if (allowed.includes('*')) return true;
    return allowed.includes(tabId);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = state.users.find(u => 
      u.username === loginForm.username && 
      (u.password === loginForm.password || (!u.password && loginForm.password === 'admin123'))
    );
    
    if (foundUser) {
      login(foundUser);
      setActiveTab(foundUser.role === 'Technician' ? 'visits' : 'dashboard');
    } else {
      setLoginError('بيانات الدخول غير صحيحة.');
    }
  };

  const navigateTo = (tab: string) => {
    if (canAccess(tab)) {
       setActiveTab(tab);
       setEditingDoc(null);
       setPrintingDoc(null);
    }
  };

  const renderContent = () => {
    if (printingDoc) {
      const client = state.clients.find(c => c.id === printingDoc.clientId);
      return <PrintView document={printingDoc} client={client} settings={state.settings} onClose={() => setPrintingDoc(null)} />;
    }

    switch (activeTab) {
      case 'gim-ai': return <GimAIPage state={state} updateState={updateState} />;
      case 'dashboard': return <Dashboard state={state} onNavigate={navigateTo} />;
      case 'visits': return <VisitsPage state={state} updateState={updateState} onNavigate={navigateTo} />;
      case 'technical-analysis': return <TechnicalAnalysis state={state} updateState={updateState} />;
      case 'client-decision': return <ClientDecision state={state} updateState={updateState} onNavigate={navigateTo} />;
      case 'scheduler': return <SchedulerPage state={state} updateState={updateState} />;
      case 'clients': return <ClientsPage state={state} updateState={updateState} />;
      case 'leads': return <LeadsPage state={state} updateState={updateState} onNavigate={navigateTo} />;
      case 'customer-issues': return <CustomerIssuesPage state={state} updateState={updateState} />;
      case 'warranties': return <WarrantiesPage state={state} updateState={updateState} onPrint={setPrintingDoc} />;
      case 'product-devis-builder': return <ProductDevisBuilder state={state} updateState={updateState} onNavigate={navigateTo} />;
      case 'pricing': return <PricingPage state={state} updateState={updateState} />;
      case 'finance': return <FinanceControl state={state} updateState={updateState} onNavigate={navigateTo} />;
      case 'devis': return <DocumentList type={DocType.DEVIS} state={state} updateState={updateState} onEdit={(doc) => { setEditingDoc(doc); setActiveTab('doc-form-devis'); }} onPrint={setPrintingDoc} onNew={() => { setEditingDoc(null); setActiveTab('product-devis-builder'); }} />;
      case 'invoices': return <DocumentList type={DocType.FACTURE} state={state} updateState={updateState} onEdit={(doc) => { setEditingDoc(doc); setActiveTab('doc-form-invoice'); }} onPrint={setPrintingDoc} onNew={() => { setEditingDoc(null); setActiveTab('doc-form-invoice'); }} />;
      case 'purchase-invoices': return <PurchaseInvoices state={state} updateState={updateState} />;
      case 'expenses': return <ExpensesPage state={state} updateState={updateState} />;
      case 'inventory': return <InventoryPage state={state} updateState={updateState} />;
      case 'user-management': return <UserManagement state={state} updateState={updateState} />;
      case 'legal': return <LegalManagement state={state} updateState={updateState} />;
      case 'settings': return <SettingsPage settings={state.settings} updateSettings={(s) => updateState(prev => ({...prev, settings: s}))} state={state} />;
      case 'automation': return <MarketingPage state={state} updateState={updateState} />;
      default: return <Dashboard state={state} onNavigate={navigateTo} />;
    }
  };

  const menuSections = [
    {
      title: "العقل والتحليلات",
      items: [
        { id: 'gim-ai', name: "الذكاء المركزي AI", icon: <Cpu size={20} /> },
        { id: 'dashboard', name: "لوحة القيادة", icon: <Grid size={20} /> },
      ]
    },
    {
      title: "العمليات الميدانية",
      items: [
        { id: 'visits', name: "المهام الجارية", icon: <Navigation2 size={20} /> },
        { id: 'technical-analysis', name: "تشخيص الأعطال", icon: <Stethoscope size={20} /> },
        { id: 'client-decision', name: "قبول أو رفض العمل", icon: <ThumbsUp size={20} /> },
        { id: 'scheduler', name: "المواعيد", icon: <Calendar size={20} /> },
      ]
    },
    {
      title: "إدارة العلاقات",
      items: [
        { id: 'clients', name: "الزبناء (CRM)", icon: <Users size={20} /> },
        { id: 'leads', name: "الفرص والطلبات", icon: <Target size={20} /> },
        { id: 'customer-issues', name: "مركز الدعم", icon: <LifeBuoy size={20} /> },
        { id: 'warranties', name: "شواهد الضمان", icon: <ShieldCheck size={20} /> },
      ]
    },
    {
      title: "الإدارة المالية",
      items: [
        { id: 'product-devis-builder', name: "منشئ عروض الأثمان", icon: <ShoppingCart size={20} /> },
        { id: 'pricing', name: "فهرس أسعار الخدمات", icon: <Banknote size={20} /> },
        { id: 'finance', name: "الخزينة والسيولة", icon: <Landmark size={20} /> },
        { id: 'devis', name: "أرشيف عروض الأثمان", icon: <FileText size={20} /> },
        { id: 'invoices', name: "فواتير الزبائن", icon: <Package size={20} /> },
        { id: 'purchase-invoices', name: "فواتير المشتريات", icon: <Truck size={20} /> },
        { id: 'expenses', name: "المصاريف", icon: <Wallet size={20} /> },
        { id: 'inventory', name: "المخزون", icon: <Box size={20} /> },
      ]
    },
    {
      title: "النظام والأمان",
      items: [
        { id: 'user-management', name: "المستخدمين", icon: <Shield size={20} /> },
        { id: 'legal', name: "القانون والأرشفة", icon: <Scale size={20} /> },
        { id: 'settings', name: "الإعدادات", icon: <SettingsIcon size={20} /> },
      ]
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-arabic" dir="rtl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-md w-full relative z-10 animate-slide-up">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-12 shadow-2xl space-y-12">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.4)] border border-blue-400/30">
                <Rocket size={48} className="text-white" />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">GIM CORE</h1>
              <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em]">Integrated Business OS</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <input required className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all" placeholder="اسم المستخدم" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
                <input required type="password" placeholder="كلمة المرور" className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              </div>
              {loginError && <p className="text-red-400 text-xs font-bold text-center">{loginError}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl hover:bg-blue-500 transition-all uppercase tracking-widest text-xs">Authorize Entry</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-arabic" dir="rtl">
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} ${isTechnician ? 'hidden lg:flex' : 'flex'} bg-[#0f172a] text-white transition-all duration-500 flex flex-col z-50 shadow-[20px_0_60px_rgba(0,0,0,0.1)]`}>
        <div className="p-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Rocket size={24} className="text-white" /></div>
            {isSidebarOpen && <h1 className="font-black text-2xl tracking-tighter text-white uppercase">Electro GIM</h1>}
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-6 pb-10 space-y-10 custom-scrollbar">
          {menuSections.map((section, sIdx) => {
            const filteredItems = section.items.filter(item => canAccess(item.id));
            if (filteredItems.length === 0) return null;
            return (
              <div key={sIdx} className="space-y-4">
                {isSidebarOpen && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{section.title}</p>}
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => navigateTo(item.id)} 
                      className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all relative ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                      {item.icon}
                      {isSidebarOpen && <span className="font-bold text-xs">{item.name}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
           <button onClick={logout} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
             <LogOut size={20} /> 
             {isSidebarOpen && <span className="font-bold text-xs">LOGOUT</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center px-6 lg:px-12 justify-between shrink-0 z-40 sticky top-0">
           <div className="flex items-center gap-4 lg:gap-6">
              {!isTechnician && (
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm"><Menu size={20} /></button>
              )}
              {isTechnician && <div className="w-10 h-10 bg-blue-600 rounded-xl flex lg:hidden items-center justify-center text-white shadow-lg"><HardHat size={20} /></div>}
              <div>
                <h1 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tight capitalize">{activeTab.replace(/-/g, ' ')}</h1>
                {isTechnician && <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest hidden lg:block">Field Environment Active</p>}
              </div>
           </div>
           
           <div className="flex items-center gap-4 lg:gap-8">
              {isTechnician && (
                <button onClick={logout} className="lg:hidden p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm border border-red-100">
                  <Power size={20} />
                  <span className="text-[10px] font-black uppercase">خروج</span>
                </button>
              )}

              <div className="flex items-center gap-4">
                 <div className="text-left hidden md:block">
                    <p className="text-[11px] font-black text-slate-900 leading-none">{user?.fullName}</p>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{user?.role}</span>
                 </div>
                 <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-[#0f172a] border-2 border-slate-200 flex items-center justify-center text-white font-black shadow-xl">
                    {user?.username.charAt(0).toUpperCase()}
                 </div>
              </div>
           </div>
        </header>

        <div className={`flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar ${isTechnician ? 'pb-24' : ''}`}>
           <div className="p-4 lg:p-8">{renderContent()}</div>
        </div>

        {isTechnician && (
          <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-2xl border border-white/10 h-20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 flex items-center justify-around px-6">
             {[
               { id: 'dashboard', name: 'Dashboard', icon: <Home size={22} /> },
               { id: 'visits', name: 'Tasks', icon: <Navigation2 size={22} /> },
               { id: 'technical-analysis', name: 'Diagnose', icon: <Stethoscope size={22} /> },
               { id: 'client-decision', name: 'Consent', icon: <ThumbsUp size={22} /> },
             ].map(item => (
               <button 
                 key={item.id} 
                 onClick={() => navigateTo(item.id)}
                 className={`flex flex-col items-center gap-1.5 transition-all relative ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500'}`}
               >
                 {activeTab === item.id && <div className="absolute -top-4 w-8 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"></div>}
                 {item.icon}
                 <span className="text-[8px] font-black uppercase">{item.name}</span>
               </button>
             ))}
          </nav>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider><AppContent /></AuthProvider>
);
export default App;
