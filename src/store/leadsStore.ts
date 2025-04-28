
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { type Lead, type Status } from '@/types/leads';

interface LeadsState {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStatus: (id: string, newStatus: Status) => void;
  getLeadsByStatus: (status: Status) => Lead[];
}

export const useLeadsStore = create<LeadsState>()(
  devtools(
    persist(
      (set, get) => ({
        leads: [],
        
        addLead: (lead) => set((state) => ({
          leads: [...state.leads, 
            { 
              ...lead, 
              id: uuidv4(), 
              createdAt: new Date().toISOString() 
            }
          ]
        })),
        
        updateLead: (id, updatedLead) => set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === id ? { ...lead, ...updatedLead } : lead
          )
        })),
        
        deleteLead: (id) => set((state) => ({
          leads: state.leads.filter(lead => lead.id !== id)
        })),
        
        moveLeadStatus: (id, newStatus) => set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === id ? { ...lead, status: newStatus } : lead
          )
        })),
        
        getLeadsByStatus: (status) => {
          return get().leads.filter(lead => lead.status === status);
        },
      }),
      {
        name: 'leads-storage',
      }
    )
  )
);
