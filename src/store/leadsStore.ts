
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type Lead, type Status, type Message } from '@/types/leads';
import * as leadsService from '@/services/leadsService';
import { toast } from '@/hooks/use-toast';

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
