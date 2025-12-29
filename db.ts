
import { AppState, Client, Document, CompanySettings } from './types';

const DB_KEY = 'electro_gim_db';

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'Electro GIM Services',
  address: 'Wifak 3 rue 3 N-143, Casablanca',
  phone: '+212 770 501 853',
  email: 'contact@electrogim.ma',
  rc: '123456',
  if: '7891011',
  ice: '001552233445566',
  bankInfo: 'RIB: 007 780 0001234567890123 45 (Attijariwafa Bank)'
};

export const getDB = (): AppState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialState: AppState = {
      clients: [],
      documents: [],
      settings: DEFAULT_SETTINGS
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
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${seq}`;
};
