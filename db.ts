
import { AppState, DocType, BaseEntity, Document, Visit } from './types';

// --- CONSTANTS ---
const DB_NAME = 'GIM_OS_Enterprise_DB';
const DB_VERSION = 4; // Incremented for complete system reset
const STORE_ACTIVE = 'active_state';
const STORE_HISTORY = 'history_log';
const LOCAL_STORAGE_KEY = 'gim_net_tech_db_v4';

// --- SYSTEM IDENTITY (The "Zero Pain" Migration Key) ---
const DEVICE_ID_KEY = 'gim_device_id';
const COMPANY_ID_KEY = 'gim_company_id';

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

const getCompanyId = (): string => {
  // In a real app, this comes from login. For now, we simulate a single tenant.
  let companyId = localStorage.getItem(COMPANY_ID_KEY);
  if (!companyId) {
    companyId = 'CMP-GIM-HQ-001'; // Default Tenant
    localStorage.setItem(COMPANY_ID_KEY, companyId);
  }
  return companyId;
};

// Factory for creating Migration-Ready Records
export const createRecord = <T>(data: Omit<T, keyof BaseEntity>): T => {
  return {
    ...data,
    id: crypto.randomUUID(),
    companyId: getCompanyId(),
    deviceId: getDeviceId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
    version: 1
  } as T;
};

// Helper to backfill legacy data
const backfillIdentity = (obj: any): any => {
  if (!obj) return obj;
  if (!obj.companyId) obj.companyId = getCompanyId();
  if (!obj.deviceId) obj.deviceId = getDeviceId();
  if (!obj.createdAt) obj.createdAt = new Date().toISOString();
  if (!obj.updatedAt) obj.updatedAt = new Date().toISOString();
  if (!obj.syncStatus) obj.syncStatus = 'synced';
  if (!obj.version) obj.version = 1;
  return obj;
};

// --- TYPES ---
export interface DBVersion {
  versionId: string;
  timestamp: string;
  label: string;
  type: 'Auto' | 'Manual' | 'System';
  stateSnapshot: AppState;
}

// --- DEFAULT STATE & SEED DATA ---
// Production Mode: Empty Identity for user to fill
const DEFAULT_IDENTITY = {
  companyName: '',
  rc: '',
  if: '',
  tp: '',
  fullName: '',
  cin: '',
  aeNumber: '',
  ice: '',
  address: '',
  phone: '',
  email: '',
  bankRib: ''
};

const today = new Date().toISOString().split('T')[0];

const INITIAL_STATE: AppState = {
  identity: DEFAULT_IDENTITY,
  
  users: [
    createRecord({
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@system.local',
      role: 'CEO',
      status: 'Active',
      password: '123' // Default password for initial access
    })
  ],

  // Empty Arrays for Production Start
  technicians: [],
  clients: [],
  inventory: [],
  tasks: [],
  documents: [], 
  visits: [],
  customerIssues: [],
  expenses: [],
  stockMovements: [],
  
  activityLogs: [],
  
  automationLogs: [],
  campaigns: [],
  leads: [],
  automationRules: [],
  servicePrices: [],
  autonomousDecisions: [],
  smartRooms: [],
  iotDevices: [],
  automationScenarios: [],
  computerAssets: [],
  securityAudits: [],
  networkDevices: [],
  settings: {
    language: 'ar',
    isProduction: true, // Set to true for real program as requested
    legal: {
      privacyPolicy: "",
      termsOfService: "",
      warrantyTerms: ""
    }
  }
};

// --- CORE DATABASE ENGINE ---
let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) { resolve(dbInstance); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => reject("Database initialization failed");
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // If upgrading to version 4, clear old data for a fresh start
      if (event.oldVersion < 4) {
        if (db.objectStoreNames.contains(STORE_ACTIVE)) db.deleteObjectStore(STORE_ACTIVE);
        if (db.objectStoreNames.contains(STORE_HISTORY)) db.deleteObjectStore(STORE_HISTORY);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(DEVICE_ID_KEY);
        localStorage.removeItem(COMPANY_ID_KEY);
      }

      if (!db.objectStoreNames.contains(STORE_ACTIVE)) db.createObjectStore(STORE_ACTIVE, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const historyStore = db.createObjectStore(STORE_HISTORY, { keyPath: 'versionId' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
  });
};

export const getDB = async (): Promise<AppState> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_ACTIVE], 'readonly');
    const store = transaction.objectStore(STORE_ACTIVE);
    const request = store.get('root');
    request.onsuccess = () => {
      if (request.result && request.result.data) {
        // --- DATA MIGRATION ON THE FLY ---
        // Ensures old data gets the new Identity Fields across ALL collections
        const migratedState = { ...request.result.data };
        Object.keys(migratedState).forEach(key => {
            if (Array.isArray(migratedState[key])) {
                migratedState[key] = migratedState[key].map(backfillIdentity);
            }
        });
        resolve(migratedState);
      } else {
        saveDB(INITIAL_STATE, 'Initial System Setup', 'System');
        resolve(INITIAL_STATE);
      }
    };
    request.onerror = () => reject("Failed to load state");
  });
};

export const saveDB = async (state: AppState, label: string = 'Auto-Save', type: 'Auto' | 'Manual' | 'System' = 'Auto'): Promise<string> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_ACTIVE, STORE_HISTORY], 'readwrite');
    const activeStore = transaction.objectStore(STORE_ACTIVE);
    activeStore.put({ id: 'root', data: state });
    const versionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const historyStore = transaction.objectStore(STORE_HISTORY);
    historyStore.add({ versionId, timestamp: new Date().toISOString(), label, type, stateSnapshot: state });
    
    // --- HISTORY CLEANUP ENGINE ---
    const index = historyStore.index('timestamp');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let autoCount = 0;

    index.openCursor(null, 'prev').onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
            const version: DBVersion = cursor.value;
            const versionDate = new Date(version.timestamp);

            if (version.type === 'Auto') {
                autoCount++;
                if (autoCount > 50) cursor.delete();
            } else if (versionDate < thirtyDaysAgo) {
                // Delete Manual/System older than 30 days to prevent bloat
                cursor.delete();
            }
            cursor.continue();
        }
    };
    transaction.oncomplete = () => {
        if (type === 'Manual') window.dispatchEvent(new CustomEvent('gim-checkpoint-created', { detail: { versionId, label } }));
        resolve(versionId);
    };
    transaction.onerror = () => reject("Transaction failed");
  });
};

export const createCheckpoint = async (state: AppState, description: string) => saveDB(state, `🛑 ${description}`, 'Manual');

export const getVersions = async (): Promise<DBVersion[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction([STORE_HISTORY], 'readonly');
    const store = transaction.objectStore(STORE_HISTORY);
    const index = store.index('timestamp');
    const request = index.getAll();
    request.onsuccess = () => resolve((request.result || []).reverse());
  });
};

export const rollbackToVersion = async (versionId: string): Promise<AppState | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_HISTORY], 'readonly');
    const store = transaction.objectStore(STORE_HISTORY);
    const request = store.get(versionId);
    request.onsuccess = async () => {
      const version: DBVersion = request.result;
      if (version) resolve(version.stateSnapshot); else reject("Version not found");
    };
    request.onerror = () => reject("Error fetching version");
  });
};

export const resetDB = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_ACTIVE, STORE_HISTORY], 'readwrite');
    const activeStore = transaction.objectStore(STORE_ACTIVE);
    const historyStore = transaction.objectStore(STORE_HISTORY);
    
    activeStore.clear();
    historyStore.clear();
    
    transaction.oncomplete = () => {
      localStorage.clear(); // Clear everything for a complete reset
      window.location.reload();
      resolve();
    };
    transaction.onerror = () => reject("Failed to reset database");
  });
};

export const generateDocNumber = (type: any, count: number): string => {
  const prefix = type === 'FACTURE' ? 'FAC' : type === 'TICKET' ? 'TKT' : 'DEV';
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

export const generateSmartDocNumber = (prefix: string, count: number): string => {
  return `${prefix}-${(count + 1).toString().padStart(5, '0')}`;
};

export const generateAutoSerialNumber = (category: string, index: number): string => {
  const year = new Date().getFullYear();
  const suffix = (index + 1).toString().padStart(5, '0');
  return `GIM-${category}-${year}-${suffix}`;
};

export const createSnapshot = (state: AppState, label: string, type: 'Auto' | 'Manual') => {
    saveDB(state, label, type);
};
