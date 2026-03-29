
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { AppState, DocType, Document, UserRole } from './types';
import { getDB, saveDB, rollbackToVersion } from './db';
import { 
  LayoutDashboard, Users, Microscope, Calendar, 
  MapPin, PenTool, Archive, BarChart3, Wallet, Box, Tag, 
  ShieldCheck, UserCircle, Scale, Database, Map as MapIcon, 
  Radio, Network, Settings as SettingsIcon, Bell,
  Megaphone, Target, Workflow, Share2, Truck, HardHat,
  CalendarClock, BrainCircuit, Fingerprint, Globe,
  Home, Cpu, Lock, ChevronDown, Store, Wrench, Menu,
  LogOut, ShieldAlert, Briefcase, FileSignature, 
  Siren, Layers, Activity, Monitor, FilePlus2, Laptop,
  Loader2, LineChart, ArrowRight, RotateCcw, X,
  Wifi, WifiOff, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle,
  ClipboardList, MessageSquare, BookOpen, Sparkles, Terminal
} from 'lucide-react';

// Core Pages
import Dashboard from './pages/Dashboard';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import ClientsPage from './pages/Clients';
import SettingsPage from './pages/Settings';
import UserManagement from './pages/UserManagement';
import BackupPage from './pages/Backup';
import LegalManagement from './pages/LegalManagement';
import Login from './pages/Login';

// Operations Pages
import CustomerIssuesPage from './pages/CustomerIssues';
import TechnicalAnalysis from './pages/TechnicalAnalysis';
import GoogleForms from './pages/GoogleForms';
import SchedulerPage from './pages/Scheduler';
import VisitsPage from './pages/Visits';
import TechniciansPage from './pages/Technicians';
import TechSchedulePage from './pages/TechSchedule';

// Network/NOC Pages
import NetworkDashboard from './pages/NetworkDashboard';
import NetworkMap from './pages/NetworkMap';
import NetworkDevices from './pages/NetworkDevices';
import NetworkFaults from './pages/NetworkFaults';

// Security Pages
import SecurityAuditPage from './pages/SecurityAudit';

// Finance & Commerce Pages
import ProductDevisBuilder from './pages/ProductDevisBuilder';
import DocumentList from './pages/DocumentList';
import FinanceControl from './pages/FinanceControl';
import ExpensesPage from './pages/Expenses';
import InventoryPage from './pages/Inventory';
import PricingPage from './pages/Pricing';
import WarrantiesPage from './pages/Warranties';
import PurchaseInvoices from './pages/PurchaseInvoices';

// Marketing & Growth Pages
import MarketingPage from './pages/Marketing';
import LeadsPage from './pages/Leads';
import AutomationPage from './pages/Automation';
import OmnichannelControl from './pages/OmnichannelControl';
import SocialMediaSettings from './pages/SocialMediaSettings';

// Mcommunication & GIM-OS Governance
import McommunicationPage from './pages/Mcommunication';
import RasHanout from './pages/Mcommunication/RasHanout';
import Karne from './pages/Mcommunication/Karne';
import L3arMode from './pages/Mcommunication/L3arMode';
import Oracle from './pages/Mcommunication/Oracle';
import GIMGovernance from './pages/Mcommunication/GIMGovernance';

// AI & Tools
import GimAIPage from './pages/GimAI';
import ClientDecision from './pages/ClientDecision';

// SMART HOME OS PAGES
import SmartDashboard from './pages/SmartHome/SmartDashboard';
import RoomsManager from './pages/SmartHome/RoomsManager';
import IoTControlCenter from './pages/SmartHome/IoTControlCenter';
import SecurityCenter from './pages/SmartHome/SecurityCenter';

// POS & WORKSHOP
import POSPage from './pages/POS/POSPage';
import ComputerWorkshop from './pages/Workshop/ComputerWorkshop';
import ElectronicsRepair from './pages/ElectronicsRepair';

import DocumentForm from './pages/DocumentForm';
import PrintView from './components/PrintView';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Configuration per Role ---
const getInitialTabForRole = (role: UserRole): string => {
  switch (role) {
    case 'Technician': return 'visits'; // Mission Control HUD
    case 'Sales': return 'pos-terminal';
    case 'Accountant': return 'invoices';
    default: return 'dashboard'; // CEO/Manager
  }
};

// --- Authenticated Layout Component ---
const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  
  // State
  const [state, setState] = useState<AppState | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navHistory, setNavHistory] = useState<string[]>([]); 
  const [editingDoc, setEditingDoc] = useState<{type: DocType, doc: Document | null} | null>(null);
  const [printDoc, setPrintDoc] = useState<Document | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  
  // --- OFFLINE/SYNC SYSTEM STATE ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'error'>('synced');
  const [pendingChanges, setPendingChanges] = useState(0);
  
  // Undo Toast State
  const [undoState, setUndoState] = useState<{ id: string, label: string } | null>(null);

  // Initialize Role-Based Tab
  useEffect(() => {
    if (user) setActiveTab(getInitialTabForRole(user.role));
  }, [user]);

  // --- 1. NETWORK LISTENERS (The Watchdog) ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingChanges > 0) {
        syncData();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      if (syncStatus === 'syncing') setSyncStatus('pending');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingChanges, syncStatus]);

  // --- 2. SYNC ENGINE ---
  const syncData = async () => {
    if (!isOnline) return;
    
    setSyncStatus('syncing');
    
    // Simulate Cloud Sync Delay
    setTimeout(() => {
      setSyncStatus('synced');
      setPendingChanges(0);
    }, 2000);
  };

  // --- 3. INITIAL LOAD (ASYNC FROM IDB) ---
  useEffect(() => {
    const loadData = async () => {
      const timeoutId = setTimeout(() => {
        if (!state && !dbError) {
          setDbError("Database connection timed out. IndexedDB might be blocked or corrupted.");
        }
      }, 10000); // 10 second timeout

      try {
        // Backend Health Check
        fetch('/api/health').then(r => r.json()).then(data => {
          console.log("Backend Health Check:", data);
        }).catch(err => {
          console.error("Backend Health Check Failed:", err);
        });

        const loadedState = await getDB();
        clearTimeout(timeoutId);
        
        // Basic Schema Validation
        if (!loadedState || typeof loadedState !== 'object' || !loadedState.identity) {
          throw new Error("Invalid database schema detected.");
        }

        setState(loadedState);
        setDbError(null);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Critical DB Error:", error);
        setDbError(error instanceof Error ? error.message : "An unknown database error occurred.");
      }
    };
    loadData();
  }, []);

  const handleResetDB = async () => {
    if (confirm("WARNING: This will delete all local data and reset the system to factory settings. Are you absolutely sure?")) {
      try {
        const DB_NAME = 'GIM_OS_Enterprise_DB';
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => {
          alert("Database reset successful. Reloading...");
          window.location.reload();
        };
        request.onerror = () => {
          alert("Failed to delete database. Please clear your browser cache manually.");
        };
      } catch (e) {
        console.error("Reset failed", e);
      }
    }
  };

  const handleRetryLoad = () => {
    setDbError(null);
    window.location.reload();
  };

  // --- 4. PERSISTENCE (DEBOUNCED AUTO-SAVE & SYNC TRIGGER) ---
  const isFirstRender = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (state) {
      // Immediate Local Save (Offline First Principle)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      // UI indicates "Pending" immediately upon change
      if (syncStatus === 'synced') {
         setSyncStatus('pending');
         setPendingChanges(prev => prev + 1);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // 1. Save to Local IndexedDB (Always succeeds if device works)
          await saveDB(state, 'Auto-Save', 'Auto');
          
          // 2. Try to Sync if Online
          if (isOnline) {
             syncData();
          } else {
             // Keep as pending if offline
             setSyncStatus('pending');
          }
        } catch (err) {
          console.error("Auto-save failed", err);
          setSyncStatus('error');
        }
      }, 2000); // 2 seconds debounce
    }
  }, [state]);

  // --- 5. LISTEN FOR MANUAL CHECKPOINTS (FOR UNDO) ---
  useEffect(() => {
    const handleCheckpoint = (event: CustomEvent<{versionId: string, label: string}>) => {
        setUndoState({ id: event.detail.versionId, label: event.detail.label });
        // Force sync on manual checkpoint if online
        if (isOnline) syncData();
        // Auto-dismiss undo after 10 seconds
        setTimeout(() => setUndoState(null), 10000);
    };

    window.addEventListener('gim-checkpoint-created', handleCheckpoint as EventListener);
    return () => window.removeEventListener('gim-checkpoint-created', handleCheckpoint as EventListener);
  }, [isOnline]);

  const performUndo = async () => {
      if (!undoState) return;
      if (confirm(`هل أنت متأكد من التراجع عن: ${undoState.label}؟`)) {
          try {
              const previousState = await rollbackToVersion(undoState.id);
              if (previousState) {
                  setState(previousState);
                  setUndoState(null);
                  alert("تم التراجع بنجاح (Restored)");
              }
          } catch (e) {
              alert("فشل في استعادة النسخة السابقة.");
          }
      }
  };

  const handleNavigate = (tab: string) => {
    if (activeTab !== tab) {
        setNavHistory(prev => [...prev, activeTab]);
        setActiveTab(tab);
    }
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleBack = () => {
      if (navHistory.length > 0) {
          const prevTab = navHistory[navHistory.length - 1];
          setNavHistory(prev => prev.slice(0, -1));
          setActiveTab(prevTab);
      }
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    if (state) {
        setState(prev => prev ? updater(prev) : null);
    }
  };

  // --- STATUS INDICATOR COMPONENT ---
  const StatusIndicator = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full border border-red-200 shadow-sm animate-pulse">
           <WifiOff size={14} className="text-red-600" />
           <span className="text-[10px] font-black uppercase tracking-widest text-red-700">Offline Mode</span>
           {pendingChanges > 0 && <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 rounded-full">{pendingChanges}</span>}
        </div>
      );
    }

    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 shadow-sm">
             <RefreshCw size={14} className="text-blue-600 animate-spin" />
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Syncing Cloud...</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200 shadow-sm">
             <CloudOff size={14} className="text-amber-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Pending Upload</span>
             <span className="bg-amber-500 text-white text-[8px] font-bold px-1.5 rounded-full">{pendingChanges}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200 shadow-sm">
             <AlertTriangle size={14} className="text-red-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-red-700">Sync Error</span>
          </div>
        );
      default: // Synced
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
             <div className="relative">
                <Cloud size={14} className="text-green-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-green-700">System Online</span>
          </div>
        );
    }
  };

  // --- LOADING & ERROR SCREENS ---
  if (dbError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mb-8 border border-red-500/30">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-4 text-red-500">DATABASE CRITICAL ERROR</h2>
        <div className="max-w-md bg-slate-900/50 border border-slate-800 p-6 rounded-2xl mb-8 font-mono text-xs text-slate-400 text-left overflow-auto max-h-40 w-full">
          <p className="text-red-400 mb-2 font-bold">Error Details:</p>
          {dbError}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={handleRetryLoad}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> Retry Loading
          </button>
          <button 
            onClick={handleResetDB}
            className="flex-1 bg-slate-800 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Database size={18} /> Emergency Reset
          </button>
        </div>
        
        <p className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          GIM-OS Enterprise v3.0 • Recovery Console
        </p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="relative mb-8">
          <Loader2 size={80} className="animate-spin text-blue-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Database size={24} className="text-blue-300" />
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-2">GIM OPERATING SYSTEM</h2>
        <div className="flex items-center gap-3 text-blue-300/60 text-xs font-mono uppercase tracking-[0.3em]">
          <span className="animate-pulse">Initializing Storage Engine</span>
          <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></span>
        </div>
      </div>
    );
  }

  if (printDoc) {
    const client = state.clients.find(c => c.id === printDoc.clientId);
    return <PrintView document={printDoc} client={client} settings={state.identity} onClose={() => setPrintDoc(null)} />;
  }

  if (editingDoc) {
    return <DocumentForm 
      initialType={editingDoc.type} 
      editingDoc={editingDoc.doc} 
      state={state} 
      updateState={updateState} 
      onCancel={() => setEditingDoc(null)} 
      onSave={() => setEditingDoc(null)} 
    />;
  }

  const renderContent = () => {
    const role = user?.role || 'Technician';
    const isTech = role === 'Technician';
    const isAdmin = role === 'CEO' || role === 'Manager';

    switch (activeTab) {
      case 'dashboard': return isAdmin ? <Dashboard state={state} onNavigate={handleNavigate} /> : <VisitsPage state={state} updateState={updateState} onNavigate={handleNavigate} />;
      case 'analytics': return isAdmin ? <AdvancedAnalytics state={state} /> : null;
      case 'clients': return <ClientsPage state={state} updateState={updateState} />;
      case 'gim-ai': return <GimAIPage state={state} updateState={updateState} />;
      case 'repair-dashboard': return <ElectronicsRepair view="dashboard" state={state} updateState={updateState} />;
      case 'repair-reception': return <ElectronicsRepair view="reception" state={state} updateState={updateState} />;
      case 'repair-workbench': return <ElectronicsRepair view="workbench" state={state} updateState={updateState} />;
      case 'workshop': return <ComputerWorkshop state={state} updateState={updateState} />;
      case 'pos-terminal': return <POSPage state={state} updateState={updateState} onPrint={setPrintDoc} />;
      case 'security-audit': return <SecurityAuditPage state={state} updateState={updateState} />;
      case 'sh-dashboard': return <SmartDashboard state={state} updateState={updateState} />;
      case 'sh-rooms': return <RoomsManager state={state} updateState={updateState} />;
      case 'sh-devices': return <IoTControlCenter state={state} updateState={updateState} />;
      case 'sh-security': return <SecurityCenter state={state} updateState={updateState} />;
      case 'customer-support': return <CustomerIssuesPage state={state} updateState={updateState} />;
      case 'scheduler': return <SchedulerPage state={state} updateState={updateState} />;
      case 'visits': return <VisitsPage state={state} updateState={updateState} onNavigate={handleNavigate} />;
      case 'client-portal': return <ClientDecision state={state} updateState={updateState} onNavigate={handleNavigate} />;
      case 'diagnosis': return <TechnicalAnalysis state={state} updateState={updateState} />;
      case 'technicians': return <TechniciansPage state={state} updateState={updateState} />;
      case 'tech-schedule': return <TechSchedulePage state={state} updateState={updateState} />;
      case 'marketing-hub': return isAdmin ? <MarketingPage state={state} updateState={updateState} /> : null;
      case 'leads': return isAdmin ? <LeadsPage state={state} updateState={updateState} onNavigate={handleNavigate} /> : null;
      case 'automation': return isAdmin ? <AutomationPage state={state} updateState={updateState} /> : null;
      case 'omnichannel': return isAdmin ? <OmnichannelControl state={state} updateState={updateState} /> : null;
      
      // Mcommunication & Governance
      case 'mcommunication': return isAdmin ? <McommunicationPage state={state} updateState={updateState} /> : null;
      case 'ras-hanout': return isAdmin ? <RasHanout state={state} /> : null;
      case 'karne': return isAdmin ? <Karne state={state} /> : null;
      case 'l3ar-mode': return isAdmin ? <L3arMode state={state} /> : null;
      case 'oracle-chat': return isAdmin ? <Oracle state={state} /> : null;
      case 'gim-governance': return isAdmin ? <GIMGovernance /> : null;

      case 'network-noc': return <NetworkDashboard state={state} />;
      case 'network-map': return <NetworkMap state={state} />;
      case 'network-devices': return <NetworkDevices state={state} updateState={updateState} />;
      case 'network-faults': return <NetworkFaults state={state} updateState={updateState} />;
      case 'devis-builder': return <ProductDevisBuilder state={state} updateState={updateState} onNavigate={handleNavigate} />;
      case 'devis-archive': return <DocumentList type={DocType.DEVIS} state={state} updateState={updateState} onEdit={(doc) => setEditingDoc({type: DocType.DEVIS, doc})} onPrint={setPrintDoc} onNew={() => setEditingDoc({type: DocType.DEVIS, doc: null})} />;
      case 'invoices': return isAdmin ? <DocumentList type={DocType.FACTURE} state={state} updateState={updateState} onEdit={(doc) => setEditingDoc({type: DocType.FACTURE, doc})} onPrint={setPrintDoc} onNew={() => setEditingDoc({type: DocType.FACTURE, doc: null})} /> : null;
      case 'taxes': return isAdmin ? <FinanceControl state={state} updateState={updateState} onNavigate={handleNavigate} /> : null;
      case 'purchases': return isAdmin ? <PurchaseInvoices state={state} updateState={updateState} /> : null;
      case 'expenses': return <ExpensesPage state={state} updateState={updateState} />;
      case 'inventory': return <InventoryPage state={state} updateState={updateState} />;
      case 'pricing': return <PricingPage state={state} updateState={updateState} />;
      case 'warranty': return <WarrantiesPage state={state} updateState={updateState} onPrint={setPrintDoc} />;
      case 'account': return isAdmin ? <UserManagement state={state} updateState={updateState} /> : null;
      case 'legal-archive': return isAdmin ? <LegalManagement state={state} updateState={updateState} /> : null;
      case 'backup': return isAdmin ? <BackupPage state={state} updateState={updateState} /> : null;
      case 'google-forms': return isAdmin ? <GoogleForms /> : null;
      case 'settings': return isAdmin ? <SettingsPage settings={state.identity} updateSettings={(s) => updateState(prev => ({...prev, identity: s}))} /> : null;
      case 'social-settings': return isAdmin ? <SocialMediaSettings settings={state.settings} updateSettings={(s) => updateState(prev => ({...prev, settings: {...prev.settings, ...s}}))} /> : null;
      default: return isAdmin ? <Dashboard state={state} onNavigate={handleNavigate} /> : <VisitsPage state={state} updateState={updateState} onNavigate={handleNavigate} />;
    }
  };

  const NavItem = ({ id, name, icon }: { id: string, name: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => handleNavigate(id)}
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === id ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      <div className={`relative z-10 transition-transform group-hover:scale-110 ${activeTab === id ? 'scale-110' : ''}`}>{icon}</div>
      <span className="relative z-10 text-xs font-bold whitespace-nowrap tracking-wide">{name}</span>
      {activeTab === id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>}
    </button>
  );

  const NavGroup = ({ title, children, defaultOpen = true }: { title: string, children?: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="mb-6">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-300 transition-colors group"
        >
          <span className="group-hover:text-white transition-colors">{title}</span>
          <ChevronDown 
            size={12} 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'rotate-0'}`} 
          />
        </button>
        <div className={`space-y-1 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {children}
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    const role = user?.role;
    
    // --- TECHNICIAN INTERFACE (Field Mode) ---
    if (role === 'Technician') {
        return (
            <div className="space-y-6 pt-4">
                {/* Profile / Status Card */}
                <div className="mx-2 p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.5rem] border border-slate-700/50 relative overflow-hidden group shadow-lg">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-blue-400/20">
                            <HardHat size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">المعرف التقني</p>
                            <p className="text-white font-black text-sm">{user?.fullName.split(' ')[0]}</p>
                        </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                {/* Core Modules - Focused & Elegant */}
                <div className="space-y-2">
                    <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <MapPin size={10}/> العمليات الميدانية
                    </p>
                    <NavItem id="visits" name="غرفة العمليات (HUD)" icon={<ShieldAlert size={20} className={activeTab === 'visits' ? 'text-white animate-pulse' : 'text-blue-500'} />} />
                    <NavItem id="scheduler" name="الأجندة والمواعيد" icon={<CalendarClock size={20} />} />
                </div>

                <div className="space-y-2">
                    <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Wrench size={10}/> أدوات الورشة
                    </p>
                    <NavItem id="diagnosis" name="التشخيص الفني" icon={<Microscope size={20} />} />
                    <NavItem id="repair-workbench" name="إصلاح الأجهزة" icon={<Monitor size={20} />} />
                    <NavItem id="inventory" name="قطع الغيار" icon={<Box size={20} />} />
                </div>

                <div className="space-y-2">
                    <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <FileSignature size={10}/> الزبون والموافقة
                    </p>
                    <NavItem id="client-portal" name="بوابة الموافقة" icon={<CheckCircle2 size={20} />} />
                    <NavItem id="gim-ai" name="المساعد الذكي (AI)" icon={<BrainCircuit size={20} />} />
                </div>
            </div>
        );
    }

    return (
        <>
            <NavGroup title="القيادة">
                <NavItem id="dashboard" name="لوحة التحكم (Tactical)" icon={<LayoutDashboard size={18} />} />
                <NavItem id="analytics" name="التحليل الاستراتيجي" icon={<LineChart size={18} />} />
                <NavItem id="clients" name="قاعدة الزبناء" icon={<Users size={18} />} />
                <NavItem id="gim-ai" name="GIM Mind 4.0" icon={<BrainCircuit size={18} />} />
            </NavGroup>
            <NavGroup title="مركز صيانة الأجهزة" defaultOpen={true}>
                <NavItem id="repair-dashboard" name="لوحة الورشة" icon={<Monitor size={18} />} />
                <NavItem id="repair-reception" name="استقبال الأجهزة" icon={<FilePlus2 size={18} />} />
                <NavItem id="repair-workbench" name="طاولة العمل" icon={<Wrench size={18} />} />
                <NavItem id="workshop" name="أصول الزبناء" icon={<Laptop size={18} />} />
            </NavGroup>
            
            {/* GIM-OS Invisible Governance Modules */}
            <NavGroup title="Mcommunication" defaultOpen={true}>
                <NavItem id="mcommunication" name="لوحة الإرسال (Campaigns)" icon={<MessageSquare size={18} />} />
                <NavItem id="ras-hanout" name="Ras L'Hanout (Feed)" icon={<Activity size={18} />} />
                <NavItem id="karne" name="Karné (Trust Ledger)" icon={<BookOpen size={18} />} />
                <NavItem id="l3ar-mode" name="L'3ar Mode (Emergency)" icon={<Siren size={18} className="text-red-500" />} />
                <NavItem id="oracle-chat" name="Oracle (Advisor)" icon={<Sparkles size={18} className="text-purple-500" />} />
                <NavItem id="gim-governance" name="GIM-OS Core Link" icon={<Terminal size={18} className="text-green-500" />} />
            </NavGroup>

            <NavGroup title="شبكات IP & IoT" defaultOpen={false}>
                <NavItem id="network-noc" name="غرفة المراقبة (NOC)" icon={<Radio size={18} />} />
                <NavItem id="network-map" name="خريطة التوصيلات" icon={<MapIcon size={18} />} />
                <NavItem id="network-devices" name="تجهيزات IP" icon={<Database size={18} />} />
                <NavItem id="sh-devices" name="وحدات IoT" icon={<Cpu size={18} />} />
                <NavItem id="network-faults" name="فحص البروتوكولات" icon={<Activity size={18} />} />
            </NavGroup>
            <NavGroup title="الدفاع السيبراني" defaultOpen={false}>
                <NavItem id="security-audit" name="Zero Trust Center" icon={<ShieldAlert size={18} className="text-red-500" />} />
            </NavGroup>
            <NavGroup title="Smart Home OS" defaultOpen={false}>
                <NavItem id="sh-dashboard" name="لوحة التحكم" icon={<Home size={18} />} />
                <NavItem id="sh-rooms" name="الغرف" icon={<LayoutDashboard size={18} />} />
                <NavItem id="sh-security" name="الأمن والمراقبة" icon={<Lock size={18} />} />
            </NavGroup>
            <NavGroup title="المتجر والمبيعات" defaultOpen={false}>
                <NavItem id="pos-terminal" name="نقطة البيع (POS)" icon={<Store size={18} />} />
            </NavGroup>
            <NavGroup title="التسويق والنمو" defaultOpen={false}>
                <NavItem id="marketing-hub" name="مركز التسويق" icon={<Megaphone size={18} />} />
                <NavItem id="leads" name="إدارة الفرص" icon={<Target size={18} />} />
                <NavItem id="automation" name="الأتمتة" icon={<Workflow size={18} />} />
                <NavItem id="google-forms" name="Google Forms" icon={<ClipboardList size={18} />} />
                <NavItem id="omnichannel" name="الربط الموحد" icon={<Share2 size={18} />} />
            </NavGroup>
            <NavGroup title="الميدان" defaultOpen={false}>
                <NavItem id="visits" name="مراقبة المهام" icon={<MapPin size={18} />} />
                <NavItem id="client-portal" name="بوابة الموافقة" icon={<FileSignature size={18} />} />
                <NavItem id="technicians" name="الفريق التقني" icon={<HardHat size={18} />} />
                <NavItem id="tech-schedule" name="الجدولة" icon={<CalendarClock size={18} />} />
                <NavItem id="customer-support" name="الدعم الفني" icon={<Bell size={18} />} />
                <NavItem id="scheduler" name="الأجندة" icon={<Calendar size={18} />} />
            </NavGroup>
            <NavGroup title="المالية" defaultOpen={false}>
                <NavItem id="devis-builder" name="منشئ العروض" icon={<PenTool size={18} />} />
                <NavItem id="devis-archive" name="الأرشيف" icon={<Archive size={18} />} />
                <NavItem id="invoices" name="الفواتير" icon={<PenTool size={18} />} />
                <NavItem id="taxes" name="الضرائب" icon={<BarChart3 size={18} />} />
                <NavItem id="purchases" name="التوريد" icon={<Truck size={18} />} />
                <NavItem id="expenses" name="المصاريف" icon={<Wallet size={18} />} />
                <NavItem id="inventory" name="المخزن" icon={<Box size={18} />} />
                <NavItem id="pricing" name="الأسعار" icon={<Tag size={18} />} />
                <NavItem id="warranty" name="الضمان" icon={<ShieldCheck size={18} />} />
            </NavGroup>
            {role === 'CEO' && (
                <NavGroup title="System" defaultOpen={false}>
                    <NavItem id="account" name="الحسابات" icon={<UserCircle size={18} />} />
                    <NavItem id="legal-archive" name="قانوني" icon={<Scale size={18} />} />
                    <NavItem id="backup" name="النسخ الاحتياطي" icon={<Database size={18} />} />
                    <NavItem id="google-forms" name="Google Forms" icon={<ClipboardList size={18} />} />
                    <NavItem id="settings" name="إعدادات الشركة" icon={<Fingerprint size={18} />} />
                    <NavItem id="social-settings" name="إعدادات الربط" icon={<SettingsIcon size={18} />} />
                </NavGroup>
            )}
        </>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-arabic" dir="rtl">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static top-0 right-0 h-full bg-[#0f172a] text-white flex flex-col z-50 border-l border-slate-800 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isSidebarOpen ? 'w-[280px] translate-x-0 shadow-2xl' : 'w-0 translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden opacity-0 lg:opacity-100'
        }`}
      >
        <div className="p-8 flex items-center gap-4 border-b border-slate-800/50 min-w-[280px]">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
             <ShieldCheck size={26} />
          </div>
          <div>
             <span className="font-black text-xl tracking-tighter block leading-none">GIM-OS</span>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user?.role} Edition</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-w-[280px]">
          {renderSidebar()}
        </div>

        <div className="p-4 border-t border-slate-800 min-w-[280px]">
           <button 
             onClick={logout}
             className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-black text-xs group"
           >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>تسجيل الخروج</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative bg-slate-50">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Menu size={22} />
              </button>
              
              {/* Back Button (Navigation History) */}
              {navHistory.length > 0 && (
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all font-bold text-xs"
                  >
                    <ArrowRight size={16} /> رجوع
                  </button>
              )}

              {/* Robust Network & Sync Indicator */}
              <div className="hidden md:block">
                 <StatusIndicator />
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                 <p className="text-sm font-black text-slate-800">{user?.fullName}</p>
                 <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <Briefcase size={10} /> {user?.role}
                 </div>
              </div>
              <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-white shadow-sm">
                 <UserCircle size={26} />
              </div>
           </div>
        </header>
        
        <div className="flex-1 w-full relative">
           {/* Mobile Status Indicator */}
           <div className="md:hidden px-6 pt-4 pb-2">
              <StatusIndicator />
           </div>
           
           {renderContent()}
        </div>

        {/* Global Undo Toast */}
        {undoState && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-300">
                <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">تم الحفظ بنجاح</span>
                        <span className="text-sm font-black">{undoState.label}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-700"></div>
                    <button 
                        onClick={performUndo}
                        className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-black text-xs uppercase transition-colors"
                    >
                        <RotateCcw size={16} /> تراجع (Undo)
                    </button>
                    <button onClick={() => setUndoState(null)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

const AppContainer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedApp /> : <Login />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContainer />
    </AuthProvider>
  );
};

export default App;
