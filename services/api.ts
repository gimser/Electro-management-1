
import { AppState, Client, Document, Task, Lead, CustomerIssue, ActivityLog } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const ApiService = {
  // --- AUTHENTICATION ---
  auth: {
    login: async (credentials: any) => {
      await delay(800);
      return { success: true, token: 'GIM-SESSION-TOKEN-XYZ' };
    }
  },

  // --- CLIENTS & LEADS ---
  clients: {
    getAll: async () => { /* Fetch from Backend */ },
    create: async (client: Partial<Client>) => {
      console.log("Pushing to Backend:", client);
      return client;
    }
  },

  leads: {
    syncFromSocial: async () => {
      try {
        const response = await fetch('/api/webhooks/pending');
        if (!response.ok) throw new Error('Failed to fetch pending leads');
        const leads = await response.json();
        
        // After fetching, we should ideally mark them as synced or delete them from pending
        // For simplicity in this scenario, we'll delete them one by one after successful sync in the component
        return leads;
      } catch (error) {
        console.error("Sync Error:", error);
        return [];
      }
    },
    deletePending: async (id: string) => {
      await fetch(`/api/webhooks/pending/${id}`, { method: 'DELETE' });
    }
  },

  // --- FINANCE & DOCUMENTS ---
  finance: {
    saveInvoice: async (doc: Document) => {
      return doc;
    }
  },

  // تم حذف قسم AI بالكامل من هنا لضمان العمل المحلي المنطقي

  // --- AUDIT & SECURITY ---
  logs: {
    push: async (log: ActivityLog) => {
    }
  }
};
