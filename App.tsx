
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  ClipboardCheck, 
  Receipt,
  Plus,
  Search,
  ChevronLeft,
  Trash2,
  Printer,
  Download,
  Menu,
  X,
  CreditCard,
  Award
} from 'lucide-react';
import { getDB, saveDB } from './db';
import { AppState, Client, DocType, Document } from './types';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import DocumentList from './pages/DocumentList';
import DocumentForm from './pages/DocumentForm';
import SettingsPage from './pages/Settings';
import PrintView from './components/PrintView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(getDB());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [printingDoc, setPrintingDoc] = useState<Document | null>(null);

  useEffect(() => {
    saveDB(state);
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(updater);
  };

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setEditingDoc(null);
    setPrintingDoc(null);
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDoc(doc);
    setActiveTab('doc-form');
  };

  const handlePrintDocument = (doc: Document) => {
    setPrintingDoc(doc);
  };

  const menuItems = [
    { id: 'dashboard', name: 'لوحة القيادة', icon: <LayoutDashboard size={20} /> },
    { id: 'clients', name: 'الزبناء', icon: <Users size={20} /> },
    { id: 'devis', name: 'عروض الأثمان (Devis)', icon: <FileText size={20} /> },
    { id: 'invoices', name: 'الفواتير (Factures)', icon: <Receipt size={20} /> },
    { id: 'contracts', name: 'عقود الصيانة', icon: <ShieldCheck size={20} /> },
    { id: 'garanties', name: 'شهادات الضمان', icon: <Award size={20} /> },
    { id: 'reports', name: 'تقارير التدخل', icon: <ClipboardCheck size={20} /> },
    { id: 'settings', name: 'الإعدادات', icon: <SettingsIcon size={20} /> },
  ];

  const renderContent = () => {
    if (printingDoc) {
      const client = state.clients.find(c => c.id === printingDoc.clientId);
      return (
        <PrintView 
          document={printingDoc} 
          client={client} 
          settings={state.settings} 
          onClose={() => setPrintingDoc(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} onNavigate={navigateTo} />;
      case 'clients':
        return <ClientsPage state={state} updateState={updateState} />;
      case 'devis':
        return <DocumentList type={DocType.DEVIS} state={state} updateState={updateState} onEdit={handleEditDocument} onPrint={handlePrintDocument} onNew={() => navigateTo('doc-form-devis')} />;
      case 'invoices':
        return <DocumentList type={DocType.FACTURE} state={state} updateState={updateState} onEdit={handleEditDocument} onPrint={handlePrintDocument} onNew={() => navigateTo('doc-form-invoice')} />;
      case 'contracts':
        return <DocumentList type={DocType.CONTRAT} state={state} updateState={updateState} onEdit={handleEditDocument} onPrint={handlePrintDocument} onNew={() => navigateTo('doc-form-contract')} />;
      case 'garanties':
        return <DocumentList type={DocType.GARANTIE} state={state} updateState={updateState} onEdit={handleEditDocument} onPrint={handlePrintDocument} onNew={() => navigateTo('doc-form-garantie')} />;
      case 'reports':
        return <DocumentList type={DocType.RAPPORT} state={state} updateState={updateState} onEdit={handleEditDocument} onPrint={handlePrintDocument} onNew={() => navigateTo('doc-form-report')} />;
      case 'doc-form':
      case 'doc-form-devis':
      case 'doc-form-invoice':
      case 'doc-form-contract':
      case 'doc-form-garantie':
      case 'doc-form-report':
        const initialType = activeTab.includes('devis') ? DocType.DEVIS : 
                            activeTab.includes('invoice') ? DocType.FACTURE : 
                            activeTab.includes('contract') ? DocType.CONTRAT : 
                            activeTab.includes('garantie') ? DocType.GARANTIE :
                            activeTab.includes('report') ? DocType.RAPPORT : DocType.DEVIS;
        return (
          <DocumentForm 
            initialType={editingDoc?.type || initialType} 
            editingDoc={editingDoc} 
            state={state} 
            updateState={updateState} 
            onCancel={() => navigateTo('dashboard')}
            onSave={() => navigateTo(initialType === DocType.GARANTIE ? 'garanties' : initialType.toLowerCase() + 's')}
          />
        );
      case 'settings':
        return <SettingsPage settings={state.settings} updateSettings={(s) => updateState(prev => ({...prev, settings: s}))} />;
      default:
        return <Dashboard state={state} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col no-print`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <div className="font-bold text-xl tracking-tight text-blue-400">Electro GIM</div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto mt-4 px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          {isSidebarOpen ? '© 2024 Electro GIM Services' : 'EGS'}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between no-print shrink-0">
          <h1 className="text-xl font-bold text-slate-800">
            {menuItems.find(m => m.id === activeTab)?.name || 'إدارة النظام'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('ar-MA')}</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              G
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
