
import { create } from 'zustand';
<<<<<<< Updated upstream
import { devtools } from 'zustand/middleware';
import { type Lead, type Status, type Message } from '@/types/leads';
import * as leadsService from '@/services/leadsService';
import { toast } from '@/hooks/use-toast';
=======
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { type Lead, type Status, type PropertyAddress, type Message, type ActionType } from '@/types/leads';
>>>>>>> Stashed changes

interface LeadsState {
  leads: Lead[];
  loading: boolean;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'messages' | 'propertyAddresses'> & { propertyAddress: string }) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  moveLeadStatus: (id: string, newStatus: Status) => Promise<void>;
  getLeadsByStatus: (status: Status) => Lead[];
  addPropertyAddress: (leadId: string, address: string) => Promise<void>;
  removePropertyAddress: (leadId: string, addressId: string) => Promise<void>;
  addMessage: (leadId: string, message: Omit<Message, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markMessageAsRead: (leadId: string, messageId: string) => Promise<void>;
  getUnreadMessageCount: (leadId: string) => number;
}

export const useLeadsStore = create<LeadsState>()(
  devtools(
<<<<<<< Updated upstream
    (set, get) => ({
      leads: [],
      loading: false,
      
      fetchLeads: async () => {
        set({ loading: true });
        try {
          const leads = await leadsService.fetchLeads();
          set({ leads });
        } catch (error) {
          console.error('Failed to fetch leads:', error);
          toast({
            title: "Failed to load leads",
            description: "Please try again or check your connection",
            variant: "destructive"
          });
        } finally {
          set({ loading: false });
=======
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
>>>>>>> Stashed changes
        }
      },
      
      addLead: async (lead) => {
        try {
          const newLead = await leadsService.createLead(lead);
          set(state => ({
            leads: [...state.leads, newLead]
          }));
          toast({
            title: "Lead created",
            description: "New lead has been added successfully"
          });
        } catch (error) {
          console.error('Failed to add lead:', error);
          toast({
            title: "Failed to create lead",
            description: "Please try again",
            variant: "destructive"
          });
          throw error;
        }
      },
      
      updateLead: async (id, updatedLead) => {
        try {
          await leadsService.updateLead(id, updatedLead);
          set(state => ({
            leads: state.leads.map(lead => 
              lead.id === id ? { ...lead, ...updatedLead } : lead
            )
          }));
          toast({
            title: "Lead updated",
            description: "Lead has been updated successfully"
          });
        } catch (error) {
          console.error('Failed to update lead:', error);
          toast({
            title: "Failed to update lead",
            description: "Please try again",
            variant: "destructive"
          });
          throw error;
        }
      },
      
      deleteLead: async (id) => {
        try {
          await leadsService.deleteLead(id);
          set(state => ({
            leads: state.leads.filter(lead => lead.id !== id)
          }));
          toast({
            title: "Lead deleted",
            description: "Lead has been removed successfully"
          });
        } catch (error) {
          console.error('Failed to delete lead:', error);
          toast({
            title: "Failed to delete lead",
            description: "Please try again",
            variant: "destructive"
          });
          throw error;
        }
      },
      
      moveLeadStatus: async (id, newStatus) => {
        try {
          await leadsService.moveLeadStatus(id, newStatus);
          set(state => ({
            leads: state.leads.map(lead => 
              lead.id === id ? { ...lead, status: newStatus } : lead
            )
          }));
        } catch (error) {
          console.error('Failed to move lead status:', error);
          toast({
            title: "Failed to update lead status",
            description: "Please try again",
            variant: "destructive"
          });
          throw error;
        }
      },
      
      getLeadsByStatus: (status) => {
        return get().leads.filter(lead => lead.status === status);
      },

      addPropertyAddress: async (leadId, address) => {
        try {
          await leadsService.addPropertyAddress(leadId, address);
          set(state => ({
            leads: state.leads.map(lead => 
              lead.id === leadId 
                ? { 
                    ...lead, 
                    propertyAddresses: [...lead.propertyAddresses, { 
                      id: `temp-${Date.now()}`, // Will be replaced on next fetch
                      address 
                    }]
                  } 
                : lead
            )
          }));
          toast({
            title: "Address added",
            description: "Property address has been added successfully"
          });
        } catch (error) {
          console.error('Failed to add property address:', error);
          toast({
            title: "Failed to add address",
            description: "Please try again",
            variant: "destructive"
          });
          throw error;
        }
      },

      removePropertyAddress: async (leadId, addressId) => {
        try {
          await leadsService.removePropertyAddress(leadId, addressId);
          set(state => ({
            leads: state.leads.map(lead => 
              lead.id === leadId 
                ? { 
                    ...lead, 
                    propertyAddresses: lead.propertyAddresses.filter(pa => pa.id !== addressId)
                  } 
                : lead
            )
          }));
          toast({
            title: "Address removed",
            description: "Property address has been removed successfully"
          });
        } catch (error) {
          console.error('Failed to remove property address:', error);
          toast({
            title: "Failed to remove address",
            description: "Please try again",
            variant: "destructive"
          });
          throw error;
        }
      },

      addMessage: async (leadId, message) => {
        try {
          await leadsService.addMessage(leadId, message);
          set(state => ({
            leads: state.leads.map(lead => 
              lead.id === leadId 
                ? { 
                    ...lead, 
                    messages: [...lead.messages, { 
                      ...message, 
                      id: `temp-${Date.now()}`, // Will be replaced on next fetch 
                      timestamp: new Date().toISOString(),
                      read: false
                    }]
                  } 
                : lead
            )
          }));
        } catch (error) {
          console.error('Failed to add message:', error);
          toast({
            title: "Failed to add message",
            description: "Please try again",
            variant: "destructive"
          });
          throw error;
        }
      },

      markMessageAsRead: async (leadId, messageId) => {
        try {
          await leadsService.markMessageAsRead(leadId, messageId);
          set(state => ({
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
          }));
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      },

      getUnreadMessageCount: (leadId) => {
        const lead = get().leads.find(l => l.id === leadId);
        if (!lead || !lead.messages) return 0;
        return lead.messages.filter(m => !m.read).length;
      }
    })
  )
);
