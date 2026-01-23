
export enum DocType {
  DEVIS = 'DEVIS',
  FACTURE = 'FACTURE',
  CONTRAT = 'CONTRAT',
  GARANTIE = 'GARANTIE',
  RAPPORT = 'RAPPORT',
  RECU = 'RECU',
  NDA = 'NDA',
  LEGAL_NOTICE = 'LEGAL_NOTICE',
  ACHAT = 'ACHAT'
}

export type UserRole = 'SuperAdmin' | 'Manager' | 'Supervisor' | 'Technician' | 'Marketing' | 'Office';
export type ClientType = 'Individual' | 'Company';
export type IssueSource = 'WhatsApp' | 'Facebook' | 'Instagram' | 'Website' | 'Phone' | 'Direct';
export type IssueStatus = 'Open' | 'Analyzing' | 'Assigned' | 'In-Progress' | 'Diagnosed' | 'Resolved' | 'Re-opened' | 'Cancelled';
export type VisitStatus = 'Planned' | 'On-Site' | 'Completed' | 'Cancelled' | 'Waiting-Approval';
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
export type MarketingChannel = 'Facebook' | 'Instagram' | 'WhatsApp' | 'Referral' | 'TikTok' | 'Direct' | 'Website' | 'Google Ads';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type AutomationTrigger = 'OnNewLead' | 'OnUrgentIssue' | 'OnNewTask' | 'OnLowStock';

export type GIMServiceCategory = 'Security & Networks' | 'Web & Apps' | 'Smart Home' | 'GIM Store';

export interface TechnicalDiagnosis {
  symptoms: string;
  rootCause: string;
  recommendation: string;
  diagnosedBy: string;
  date: string;
  voiceTranscript?: string; 
}

export interface AutonomousDecision {
  id: string;
  triggerEvent: string;
  actionTaken: string;
  confidenceScore: number;
  logicPath: string;
  timestamp: string;
  status: 'Executed' | 'Failed' | 'Intervened';
}

export interface WorkingDay {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface NotificationConfig {
  email: boolean;
  whatsapp: boolean;
  system: boolean;
  lowStockAlert: boolean;
  newLeadAlert: boolean;
  paymentReminder: boolean;
}

export interface CommunicationLog {
  id: string;
  date: string;
  type: 'Call' | 'WhatsApp' | 'Email' | 'Meeting' | 'Note';
  summary: string;
  agent: string;
}

export interface Visit {
  id: string;
  clientId: string;
  technicianId: string;
  taskId?: string;
  date: string;
  scheduledTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  actualDurationMinutes?: number;
  status: VisitStatus;
  notes?: string;
  linkedInvoiceId?: string;
  linkedDevisId?: string; 
  isBilled: boolean;
  potentialPoints?: number; // نقاط محتملة للمهمة
}

export interface StockMovement {
  id: string;
  inventoryId: string;
  type: MovementType;
  quantity: number;
  date: string;
  reason: string;
  performedBy: string;
  referenceId?: string;
}

export interface AIPrediction {
  id: string;
  targetId: string;
  type: 'MaintenanceNeeded' | 'ChurnRisk' | 'InventoryShortage' | 'RevenueDrop';
  probability: number;
  suggestedAction: string;
  reasoning: string;
  timestamp: string;
  status: 'Pending' | 'Applied' | 'Ignored';
}

export interface AIDecision {
  id: string;
  action: string;
  impact: 'High' | 'Medium' | 'Low';
  confidence: number;
  logic: string;
  timestamp: string;
  outcome?: string;
}

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password?: string; 
  role: UserRole;
  status: 'Active' | 'Disabled';
  lastLogin?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Critical';
  details: string;
}

export interface Client {
  id: string;
  name: string;
  clientType: ClientType;
  ice?: string; 
  phone: string;
  email: string;
  address: string;
  city: string;
  createdAt: string;
  category?: 'Standard' | 'VIP' | 'Wholesale';
  loyaltyScore?: number;
  internalNotes?: string;
  communicationHistory?: CommunicationLog[];
  leadId?: string;
  acquisitionSource?: string;
  isRedFlagged?: boolean; 
  debtLevel?: 'Normal' | 'Nudge' | 'Warning' | 'Blocked'; 
}

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category: GIMServiceCategory;
  quantity: number;
  unit: string;
  minQuantity: number;
  purchasePrice: number; 
  sellingPrice: number;  
}

export interface Document {
  id: string;
  clientId: string;
  type: DocType;
  number: string;
  date: string;
  dueDate?: string;
  items: LineItem[];
  subtotal: number;
  tva: number;
  total: number;
  paidAmount?: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled' | 'Partially-Paid' | 'Archived' | 'Accepted' | 'Rejected';
  notes?: string;
  aiSuggestedPrice?: boolean;
  interventionDetails?: string;
  warrantyPeriod?: string;
  autoAcceptedAt?: string; 
  rejectionReason?: string; 
  providerName?: string;
}

export interface LineItem {
  id: string;
  inventoryId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  date: string;
  time: string;
  technician: string;
  status: 'Pending' | 'In-Progress' | 'Completed';
  description: string;
  actualStartTime?: string;
  actualEndTime?: string;
  actualDurationMinutes?: number;
  autonomousId?: string; 
}

export interface IssueComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface CustomerIssue {
  id: string;
  clientId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: IssueStatus;
  source: IssueSource;
  category?: GIMServiceCategory | 'General';
  createdAt: string;
  aiInsights?: string;
  aiSuggestedSolution?: string;
  comments?: IssueComment[];
  mediaUrls?: string[];
  diagnosis?: TechnicalDiagnosis; 
  taskId?: string; 
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'failed';
  details: string;
}

export interface AutomationRule {
  id: string;
  trigger: AutomationTrigger; 
  action: string;
  template: string;
  active: boolean;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: string;
  status: 'Active' | 'Paused' | 'Completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  leadsCount: number;
  conversionsCount: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  interest: string;
  source: MarketingChannel;
  status: LeadStatus; 
  priority: string;
  createdAt: string;
  conversionProbability?: number;
  category?: string; 
  notes?: string[]; 
  campaignId?: string; 
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialty: GIMServiceCategory;
  status: 'Active' | 'Inactive';
  joinDate: string;
  maxDailyTasks: number;
  performanceRating: number;
  bonusPoints: number; 
  level?: number; // مستوى التقني
  exp?: number; // نقاط الخبرة التراكمية
  badges?: string[]; // أوسمة محققة
  weeklySchedule?: Record<string, string[]>;
  currentLocation?: { lat: number, lng: number }; 
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'Materials' | 'Rent' | 'Salary' | 'Transport' | 'Other';
}

export interface ServicePrice {
  id: string;
  code?: string;
  serviceName: string;
  category: GIMServiceCategory;
  price: number;
  description: string;
}

export interface LegalNotice {
  id: string;
  title: string;
  content: string;
  version: string;
  lastUpdated: string;
  active: boolean;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  rc: string;
  if: string;
  ice: string;
  bankInfo: string;
  logoUrl?: string;
  stampUrl?: string;
  language: 'ar' | 'fr';
  currency: 'MAD' | 'USD' | 'EUR';
  userRole: UserRole;
  aiAutomationLevel: number;
  isFullyAutonomous: boolean; 
  aiFeaturesEnabled: {
    autoPriority: boolean;
    predictiveStock: boolean;
    smartInvoicing: boolean;
    clientClassification: boolean;
    securityAlerts: boolean;
  };
  workingHours: WorkingDay[];
  notifications: NotificationConfig;
  integrations: {
    facebookConnected: boolean;
    whatsappConnected: boolean;
    webhookSecret?: string;
    websiteUrl?: string;
    facebookPageId?: string;
    facebookAccessToken?: string;
    instagramId?: string;
    whatsappPhoneId?: string;
    whatsappAccessToken?: string;
    apiKey: string;
    externalEndpoint: string;
  };
  legal?: {
    privacyPolicy: string;
    termsOfService: string;
    warrantyTerms: string;
  };
}

export interface AppState {
  users: AppUser[];
  activityLogs: ActivityLog[];
  clients: Client[];
  technicians: Technician[];
  documents: Document[];
  expenses: Expense[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[]; 
  tasks: Task[];
  leads: Lead[];
  campaigns: MarketingCampaign[];
  customerIssues: CustomerIssue[];
  servicePrices: ServicePrice[];
  automationRules: AutomationRule[];
  automationLogs: AutomationLog[];
  aiDecisions: AIDecision[]; 
  aiPredictions: AIPrediction[]; 
  autonomousDecisions: AutonomousDecision[]; 
  settings: CompanySettings;
  visits: Visit[];
  legalNotices: LegalNotice[];
}

export enum Type {
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN'
}
