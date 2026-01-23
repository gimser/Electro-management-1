
import { AppState, CompanySettings, DocType, AppUser, ActivityLog, Visit, InventoryItem, StockMovement, MarketingCampaign, AutomationRule, Lead, AIDecision, AIPrediction, WorkingDay, ServicePrice, AutonomousDecision, Client, CustomerIssue, Task } from './types';

const DB_KEY = 'gim_services_db_v3_autonomous';

// الاحتفاظ فقط بحساب المسؤول للدخول الأول
const DEFAULT_USERS: AppUser[] = [
  { id: 'u1', username: 'admin', fullName: 'مدير النظام الرئيسي', email: 'admin@gimservices.ma', role: 'SuperAdmin', status: 'Active', password: 'admin123', createdAt: new Date().toISOString() }
];

// تفريغ كافة المصفوفات من البيانات الوهمية
const DEFAULT_CLIENTS: Client[] = [];
const DEFAULT_INVENTORY: InventoryItem[] = [];
const DEFAULT_ISSUES: CustomerIssue[] = [];
const DEFAULT_TASKS: Task[] = [];
const DEFAULT_VISITS: Visit[] = [];
const DEFAULT_SERVICES: ServicePrice[] = [];
const DEFAULT_AUTONOMOUS_DECISIONS: AutonomousDecision[] = [];

const DEFAULT_WORKING_HOURS: WorkingDay[] = [
  { day: 'الاثنين', open: '09:00', close: '18:00', isClosed: false },
  { day: 'الثلاثاء', open: '09:00', close: '18:00', isClosed: false },
  { day: 'الأربعاء', open: '09:00', close: '18:00', isClosed: false },
  { day: 'الخميس', open: '09:00', close: '18:00', isClosed: false },
  { day: 'الجمعة', open: '09:00', close: '12:00', isClosed: false },
  { day: 'السبت', open: '10:00', close: '15:00', isClosed: false },
  { day: 'الأحد', open: '00:00', close: '00:00', isClosed: true },
];

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'شركة GIM Services',
  address: 'العنوان الرسمي هنا',
  phone: '+212 5XX XX XX XX',
  email: 'contact@yourdomain.ma',
  rc: '000000', if: '000000', ice: '0000000000000000',
  bankInfo: 'RIB: 000 000 0000000000000000 00',
  logoUrl: '',
  stampUrl: '',
  language: 'ar', currency: 'MAD', userRole: 'SuperAdmin',
  aiAutomationLevel: 50,
  isFullyAutonomous: false,
  aiFeaturesEnabled: { autoPriority: true, predictiveStock: true, smartInvoicing: true, clientClassification: true, securityAlerts: true },
  workingHours: DEFAULT_WORKING_HOURS,
  notifications: { email: true, whatsapp: false, system: true, lowStockAlert: true, newLeadAlert: true, paymentReminder: true },
  integrations: { facebookConnected: false, whatsappConnected: false, webhookSecret: '', websiteUrl: '', apiKey: 'GIM-CORE-SECURE-KEY', externalEndpoint: '' }
};

export const getDB = (): AppState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialState: AppState = {
      users: DEFAULT_USERS,
      activityLogs: [],
      clients: DEFAULT_CLIENTS,
      technicians: [], 
      documents: [], 
      expenses: [], 
      inventory: DEFAULT_INVENTORY, 
      stockMovements: [], 
      tasks: DEFAULT_TASKS, 
      leads: [], 
      campaigns: [],
      customerIssues: DEFAULT_ISSUES, 
      servicePrices: DEFAULT_SERVICES, 
      automationRules: [], 
      automationLogs: [], 
      aiDecisions: [], 
      aiPredictions: [],
      autonomousDecisions: DEFAULT_AUTONOMOUS_DECISIONS,
      settings: DEFAULT_SETTINGS, 
      visits: DEFAULT_VISITS, 
      legalNotices: []
    };
    saveDB(initialState);
    return initialState;
  }
  return JSON.parse(data);
};

export const saveDB = (state: AppState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

export const generateDocNumber = (type: string, count: number) => {
  const prefix = type.substring(0, 3).toUpperCase();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}${month}${day}-${seq}`;
};

export const generateSmartDocNumber = (prefix: string, countToday: number) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const seq = String(countToday + 1).padStart(4, '0');
  return `${prefix}-${dateStr}-${seq}`;
};
