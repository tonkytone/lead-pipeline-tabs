import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { type Lead, type Status, type PropertyAddress, type Message, type ActionType } from '@/types/leads';

interface LeadsState {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'messages' | 'propertyAddresses'> & { propertyAddress: string }) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStatus: (id: string, newStatus: Status) => void;
  getLeadsByStatus: (status: Status) => Lead[];
  addPropertyAddress: (leadId: string, address: string) => void;
  removePropertyAddress: (leadId: string, addressId: string) => void;
  addMessage: (leadId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  markMessageAsRead: (leadId: string, messageId: string) => void;
  getUnreadMessageCount: (leadId: string) => number;
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
              createdAt: new Date().toISOString(),
              messages: [],
              propertyAddresses: [{ id: uuidv4(), address: lead.propertyAddress }],
              projectId: `QO-${Math.floor(1000 + Math.random() * 9000)}`
            }
          ]
        })),
        
        updateLead: (id, updatedLead) => set((state) => {
          console.log('updateLead called with id:', id, 'and updatedLead:', updatedLead);
          return {
            leads: state.leads.map(lead => {
              if (lead.id !== id) return lead;
              const newLead = { ...lead, ...updatedLead };
              if (updatedLead.nextAction) {
                const actionsOrder: ActionType[] = [
                  "Send introductory info",
                  "Make a follow-up phone call",
                  "Reminder",
                  "Qualify",
                  "Book appraisal",
                  "Prepare listing kit",
                  "Send listing kit",
                  "Hold appraisal meeting",
                  "Enter new management details",
                  "Create management agreement",
                  "Send agreement for signing",
                  "Request Signature",
                  "Confirm signing",
                  "Upload signed agreement",
                  "Verify property ownership and investor IDs",
                  "Finalise opportunity"
                ];
                const idx = actionsOrder.findIndex(a => a === updatedLead.nextAction);
                const qualifyIdx = actionsOrder.findIndex(a => a === "Qualify");
                const holdIdx = actionsOrder.findIndex(a => a === "Hold appraisal meeting");
                const confirmIdx = actionsOrder.findIndex(a => a === "Confirm signing");
                if (idx > confirmIdx) {
                  newLead.status = "Signed";
                } else if (idx > holdIdx) {
                  newLead.status = "Presented";
                } else if (idx > qualifyIdx) {
                  newLead.status = "Engaged";
                }
              }
              return newLead;
            })
          };
        }),
        
        deleteLead: (id) => set((state) => ({
          leads: state.leads.filter(lead => lead.id !== id)
        })),
        
        moveLeadStatus: (id, newStatus) => set((state) => {
          console.log('moveLeadStatus called with id:', id, 'and newStatus:', newStatus);
          return {
            leads: state.leads.map(lead => 
              lead.id === id ? { ...lead, status: newStatus } : lead
            )
          };
        }),
        
        getLeadsByStatus: (status) => {
          return get().leads.filter(lead => lead.status === status);
        },

        addPropertyAddress: (leadId, address) => set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  propertyAddresses: [...lead.propertyAddresses, { id: uuidv4(), address }]
                } 
              : lead
          )
        })),

        removePropertyAddress: (leadId, addressId) => set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  propertyAddresses: lead.propertyAddresses.filter(pa => pa.id !== addressId)
                } 
              : lead
          )
        })),

        addMessage: (leadId, message) => set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  messages: [...lead.messages, { 
                    ...message, 
                    id: uuidv4(), 
                    timestamp: new Date().toISOString(),
                    read: false // Initialize as unread
                  }]
                } 
              : lead
          )
        })),

        markMessageAsRead: (leadId, messageId) => set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  messages: lead.messages.map(msg => 
                    msg.id === messageId ? { ...msg, read: true } : msg
                  )
                } 
              : lead
          )
        })),

        getUnreadMessageCount: (leadId) => {
          const lead = get().leads.find(l => l.id === leadId);
          if (!lead || !lead.messages) return 0;
          return lead.messages.filter(m => !m.read).length;
        }
      }),
      {
        name: 'leads-storage',
      }
    )
  )
);
