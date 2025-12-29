
export enum DocType {
  DEVIS = 'DEVIS',
  FACTURE = 'FACTURE',
  CONTRAT = 'CONTRAT',
  GARANTIE = 'GARANTIE',
  RAPPORT = 'RAPPORT',
  RECU = 'RECU'
}

export interface Client {
  id: string;
  name: string;
  ice: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Document {
  id: string;
  clientId: string;
  type: DocType;
  number: string;
  date: string;
  items: LineItem[];
  subtotal: number;
  tva: number; // Percentage
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
  notes?: string;
  warrantyPeriod?: string; // For Warranty certs
  interventionDetails?: string; // For technical reports
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
}

export interface AppState {
  clients: Client[];
  documents: Document[];
  settings: CompanySettings;
}
