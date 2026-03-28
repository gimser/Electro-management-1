
// Domain types for GIM-NET TECH System - Enterprise Edition (SARL/SaaS)

// --- ARCHITECTURE CORE: IDENTITY & SYNC ---
// This interface ensures every record is ready for Cloud Migration (Supabase/Firebase)
export interface BaseEntity {
  id: string;           // record_uuid (Universally Unique)
  companyId: string;    // Multi-tenancy: Who owns this data?
  deviceId: string;     // Audit: Which device created this?
  userId?: string;      // Audit: Which user created this?
  createdAt: string;    // ISO Timestamp
  updatedAt: string;    // ISO Timestamp
  syncStatus: 'synced' | 'pending' | 'error';
  version: number;      // Optimistic Locking
}

export enum DocType {
  DEVIS = 'DEVIS',
  FACTURE = 'FACTURE',
  INTERVENTION_LOG = 'INTERVENTION_LOG',
  WARRANTY = 'WARRANTY',
  ACHAT = 'ACHAT',
  CONTRAT = 'CONTRAT',
  GARANTIE = 'GARANTIE',
  RAPPORT = 'RAPPORT',
  NDA = 'NDA',
  TICKET = 'TICKET', 
  SECURITY_REPORT = 'SECURITY_REPORT'
}

export type ClientType = 'Individual' | 'Company' | 'Government';
export type UserRole = 'CEO' | 'Manager' | 'Accountant' | 'Technician' | 'Sales';
export type IssueStatus = 'Open' | 'Analyzing' | 'Assigned' | 'In-Progress' | 'Resolved' | 'Re-opened' | 'Cancelled' | 'Diagnosed';
export type IssueSource = 'WhatsApp' | 'Facebook' | 'Instagram' | 'Website' | 'Phone' | 'Direct';
export type GIMServiceCategory = 'صيانة الأجهزة' | 'الشبكات والكاميرات' | 'أنظمة الإنذار' | 'خدمات أخرى' | 'Security & Networks' | 'Web & Apps' | 'Smart Home' | 'GIM Store' | 'Consulting' | 'Cyber Security';

// --- Mcommunication Governance Types ---
export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl?: string;
  timestamp: string;
  reportsCount: number;
  riskScore: number; // 0-100 (AI calculated)
  status: 'Live' | 'Flagged' | 'Shadowbanned' | 'Removed';
  viralityIndex: number;
}

export interface ModerationAction {
  id: string;
  postId: string;
  moderatorId: string;
  action: 'APPROVE' | 'REMOVE' | 'SHADOWBAN' | 'WARNING';
  reason: string;
  timestamp: string;
}

export interface AlgoParameter {
  id: string;
  key: string;
  label: string;
  value: number; // 0-100
  description: string;
  impactZone: 'Feed' | 'Notifications' | 'Visibility';
}

// --- Cyber Security & Zero Trust ---
export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';

export interface Vulnerability {
  id: string;
  cve?: string;
  title: string;
  riskLevel: RiskLevel;
  status: 'Open' | 'Mitigated' | 'False Positive';
  remediation: string;
}

export interface ZeroTrustStatus {
  identityScore: number;
  networkScore: number;
  endpointScore: number;
  overallScore: number;
  lastAuditDate: string;
}

export interface SecurityAudit extends BaseEntity {
  clientId: string;
  date: string;
  technician: string;
  scope: string;
  zeroTrustStatus: ZeroTrustStatus;
  vulnerabilities: Vulnerability[];
  reportUrl?: string;
}

// --- NOC & Networks ---
export type DeviceStatus = 'Online' | 'Offline' | 'Warning' | 'Predictive-Failure' | 'Isolating' | 'Compromised';
export type DeviceType = 'Router' | 'Switch' | 'AccessPoint' | 'IP-Camera' | 'Server' | 'NVR' | 'UPS' | 'Firewall' | 'IoT-Gateway';

export interface NetworkDevice extends BaseEntity {
  clientId: string;
  name: string;
  ip: string;
  type: DeviceType;
  status: DeviceStatus;
  uptime: number; 
  cpuLoad: number;
  temp: number;
  healthScore: number;
  failureRisk: number;
  lastSeen: string;
  macAddress: string;
  modelName: string;
  firmwareVersion: string;
  notes: string;
  segment?: string;
  isIsolated?: boolean;
}

// --- COMPUTER WORKSHOP ---
export type ComputerType = 'Laptop' | 'Desktop' | 'Server' | 'Workstation';
export interface ComputerAsset extends BaseEntity {
  clientId: string;
  name: string;
  serialNumber: string;
  type: ComputerType;
  specs: {
    cpu: string;
    ram: string;
    disk: string;
    gpu: string;
  };
  health: {
    status: 'Healthy' | 'Warning' | 'Critical';
    diskLife: number;
    batteryHealth?: number;
    cpuTemp: number;
    lastBootTime: string;
    bluescreenCount: number;
  };
  reportedIssue?: string;
  agentInstalled: boolean;
  lastSync: string;
  prediction?: string;
}

// --- SMART HOME OS ---
export type IoTProtocol = 'WiFi' | 'Zigbee' | 'Z-Wave' | 'MQTT' | 'Matter' | 'RTSP';
export type IoTDeviceType = 'Light' | 'AC' | 'Lock' | 'Camera' | 'Sensor' | 'Outlet' | 'Thermostat';

export interface SmartRoom extends BaseEntity {
  name: string;
  type: 'Living' | 'Bedroom' | 'Kitchen' | 'Office' | 'Outdoor';
  floor: number;
  image?: string;
  temperature: number;
  humidity: number;
  powerUsage: number;
}

export interface IoTDevice extends BaseEntity {
  clientId?: string;
  roomId: string;
  name: string;
  type: IoTDeviceType;
  protocol: IoTProtocol;
  ipAddress: string;
  macAddress: string;
  port: number;
  status: 'Online' | 'Offline' | 'Updating' | 'Error';
  state: any;
  firmware: string;
  lastPing: number;
  powerConsumption: number;
  batteryLevel?: number;
  networkSegment?: 'Main' | 'Guest' | 'IoT_Isolated';
}

export interface AutomationScenario extends BaseEntity {
  name: string;
  active: boolean;
  trigger: string;
  action: string;
  lastRun: string;
}

export interface CommunicationLog {
  id: string;
  timestamp: string;
  type: 'Call' | 'Message' | 'Email';
  details: string;
}

export interface Client extends BaseEntity {
  name: string;
  clientType: ClientType;
  phone: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  isRedFlagged?: boolean;
  ice?: string;
  email?: string;
  category?: 'Standard' | 'VIP' | 'Corporate';
  serviceCategory?: GIMServiceCategory;
  loyaltyScore?: number;
  internalNotes?: string;
  communicationHistory?: CommunicationLog[];
  managerName?: string;
  serviceSize?: 'صغير' | 'متوسط' | 'كبير';
  description?: string;
  status?: 'جديد' | 'Active' | 'Inactive' | 'Archived';
}

export interface AEIdentity {
  companyName: string;
  rc: string;
  ice: string;
  if: string;
  tp: string;
  cnss?: string;
  address: string;
  phone: string;
  email: string;
  bankRib: string;
  capital?: number;
  fullName?: string;
  aeNumber?: string;
  cin?: string;
  logo?: string;
  stamp?: string;
}

export interface LineItem {
  id: string;
  inventoryId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Document extends BaseEntity {
  clientId: string;
  type: DocType;
  number: string;
  date: string;
  dueDate?: string;
  items: LineItem[];
  subtotal: number;
  tvaAmount: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partially-Paid' | 'Cancelled' | 'Archived' | 'Accepted' | 'Rejected';
  notes?: string;
  paidAmount?: number;
  providerName?: string;
  interventionDetails?: string;
  warrantyPeriod?: string;
  rejectionReason?: string;
  autoAcceptedAt?: string;
}

export interface Expense extends BaseEntity {
  description: string;
  amount: number;
  tvaReclaimable?: number;
  date: string;
  category: 'Materials' | 'Rent' | 'Salary' | 'Transport' | 'Other' | 'Taxes';
}

export interface InventoryItem extends BaseEntity {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
}

export interface Task extends BaseEntity {
  title: string;
  clientId: string;
  date: string;
  time: string;
  technician: string;
  status: 'Pending' | 'In-Progress' | 'Completed' | 'Cancelled';
  description?: string;
}

export interface XPEntry {
    id: string;
    date: string;
    amount: number;
    reason: string;
    type: 'GAIN' | 'PENALTY';
}

export interface Technician extends BaseEntity {
  name: string;
  phone: string;
  specialty: GIMServiceCategory;
  status: 'Active' | 'Inactive';
  joinDate: string;
  maxDailyTasks: number;
  performanceRating: number;
  bonusPoints: number;
  level: number;
  exp: number;
  badges: string[];
  weeklySchedule?: Record<string, string[]>;
  xpHistory?: XPEntry[];
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
export type MarketingChannel = 'Facebook' | 'Instagram' | 'WhatsApp' | 'Referral' | 'TikTok' | 'Direct' | 'Website' | 'Google Ads';

export interface Lead extends BaseEntity {
  name: string;
  phone: string;
  interest: string;
  source: MarketingChannel;
  status: LeadStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  category: string;
  notes: string[];
  campaignId?: string;
  conversionProbability: number;
  clientType?: ClientType;
  managerName?: string;
  serviceSize?: 'صغير' | 'متوسط' | 'كبير';
  description?: string;
  city?: string;
  email?: string;
}

export type AutomationTrigger = 'OnNewLead' | 'OnUrgentIssue' | 'OnNewTask' | 'OnLowStock';

export interface AutomationRule extends BaseEntity {
  trigger: AutomationTrigger;
  action: 'Template';
  template: string;
  active: boolean;
}

export interface ServicePrice extends BaseEntity {
  code: string;
  serviceName: string;
  category: GIMServiceCategory;
  price: number;
  description: string;
}

export type MissionPhase = 
  | 'DISPATCHED' | 'TRAVELING' | 'ON_SITE' | 'DIAGNOSIS' | 'APPROVAL_WAIT' | 'WORKING' | 'VERIFICATION' | 'COMPLETED' | 'DIAGNOSIS_BILLING';

export interface ProofOfWork {
  photoBefore?: string;
  photoAfter?: string;
  gpsArrival?: { lat: number; lng: number };
  gpsDeparture?: { lat: number; lng: number };
  startTime?: string;
  endTime?: string;
  clientSignature?: string;
  technicianNotes?: string;
  technicianName?: string;
  diagnosisFee?: number; // Fee charged if repair is rejected
}

export interface Visit extends BaseEntity {
  taskId: string;
  clientId: string;
  technicianId: string;
  status: 'Planned' | 'In-Route' | 'On-Site' | 'Waiting-Approval' | 'Completed' | 'Cancelled';
  phase?: MissionPhase; 
  proofOfWork?: ProofOfWork;
  notes?: string;
  checkInTime?: string;
  linkedDevisId?: string;
}

export interface AutonomousDecision extends BaseEntity {
  triggerEvent: string;
  actionTaken: string;
  confidenceScore: number;
  logicPath: string;
  timestamp: string;
  status: 'Executed' | 'Failed';
}

export interface TechnicalDiagnosis {
    symptoms: string;
    rootCause: string;
    recommendation: string;
    diagnosedBy: string;
    date: string;
    requiredParts?: {
      inventoryId: string;
      name: string;
      quantity: number;
      price: number;
    }[];
}

export interface CustomerIssue extends BaseEntity {
  clientId: string;
  assetId?: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: IssueStatus;
  source: IssueSource;
  category: GIMServiceCategory;
  systemAnalysis?: string;
  logicSuggestedSolution?: string;
  mediaUrls?: string[];
  externalCondition?: string;
  customerSignature?: string;
  laborTime?: number;
  workStatus?: 'Pending' | 'Working' | 'Paused' | 'Stopped';
  lastStartedAt?: string;
  pauseReason?: string;
  comments?: any[];
  diagnosis?: TechnicalDiagnosis;
}

export interface ActivityLog extends BaseEntity {
  username: string;
  action: string;
  module: 'CLIENT' | 'INVENTORY' | 'SCHEDULER' | 'TECHNICAL' | 'LEGAL' | 'NOC' | 'ADVISOR' | 'MARKETING' | 'FINANCE' | 'HR' | 'SMART_HOME' | 'POS' | 'WORKSHOP' | 'SECURITY' | 'SYS' | 'GOVERNANCE';
  timestamp: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
  status?: 'success' | 'failed';
}

export interface AppUser extends BaseEntity {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  password?: string;
}

export interface StockMovement extends BaseEntity {
  inventoryId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  reason: string;
  performedBy: string;
  referenceId?: string;
}

export interface MetaIntegration {
  whatsappEnabled: boolean;
  facebookEnabled: boolean;
  instagramEnabled: boolean;
  verifyToken: string;
  accessToken: string;
  phoneNumberId: string;
}

export interface CompanySettings {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  ice: string;
  rc?: string;
  integrations: {
    facebookPageId?: string;
    facebookAccessToken?: string;
    instagramId?: string;
    phoneNumberId?: string;
    accessToken?: string;
    websiteUrl?: string;
    webhookSecret?: string;
  };
  metaConfig?: MetaIntegration;
  legal?: {
    privacyPolicy: string;
    termsOfService: string;
    warrantyTerms: string;
  };
}

export interface MarketingCampaign extends BaseEntity {
  name: string;
  platform: MarketingChannel;
  status: 'Active' | 'Paused' | 'Ended';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  leadsCount: number;
  conversionsCount: number;
}

// --- ARCHITECTURAL SPLIT: Core, Ops, UI ---

export interface CoreState {
  identity: AEIdentity;
  users: AppUser[];
  settings: {
    language: 'ar' | 'fr';
    legal: {
      privacyPolicy: string;
      termsOfService: string;
      warrantyTerms: string;
    };
    metaConfig?: MetaIntegration;
    integrations?: CompanySettings['integrations'];
    isProduction?: boolean; // Production mode flag
  };
  // Financial Core
  documents: Document[];
  expenses: Expense[];
  inventory: InventoryItem[];
  servicePrices: ServicePrice[];
  stockMovements: StockMovement[];
}

export interface OpsState {
  // CRM & Field
  clients: Client[];
  tasks: Task[];
  visits: Visit[];
  technicians: Technician[];
  customerIssues: CustomerIssue[];
  // Modules
  networkDevices: NetworkDevice[];
  computerAssets: ComputerAsset[];
  // Smart Home
  smartRooms: SmartRoom[];
  iotDevices: IoTDevice[];
  automationScenarios: AutomationScenario[];
  // Security
  securityAudits: SecurityAudit[];
  // Growth & Auto
  leads: Lead[];
  campaigns: MarketingCampaign[];
  automationRules: AutomationRule[];
  autonomousDecisions: AutonomousDecision[];
}

export interface UIState {
  activityLogs: ActivityLog[];
  automationLogs: any[];
}

export type AppState = CoreState & OpsState & UIState;
