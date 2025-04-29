
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { type Lead, type Status, type PropertyAddress, type Message } from '@/types/leads';

export async function fetchLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      property_addresses:property_addresses(*),
      messages:messages(*)
    `);
  
  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
  
  // Transform from database format to application format
  return (data || []).map(transformLeadFromDB);
}

export async function fetchLeadsByStatus(status: Status) {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      property_addresses:property_addresses(*),
      messages:messages(*)
    `)
    .eq('status', status);
  
  if (error) {
    console.error('Error fetching leads by status:', error);
    throw error;
  }
  
  return (data || []).map(transformLeadFromDB);
}

export async function createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'messages' | 'propertyAddresses'> & { propertyAddress: string }) {
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const leadId = uuidv4();
  const projectId = `QO-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Create the lead
  const { error: leadError } = await supabase
    .from('leads')
    .insert({
      id: leadId,
      user_id: user.id,
      name: lead.name,
      urgency: lead.urgency,
      next_action: lead.nextAction,
      assignee: lead.assignee,
      close_date: lead.closeDate,
      status: lead.status,
      notes: lead.notes,
      email: lead.email,
      phone: lead.phone,
      referrer_source: lead.referrerSource,
      project_id: projectId
    });
  
  if (leadError) {
    console.error('Error creating lead:', leadError);
    throw leadError;
  }
  
  // Add the property address
  const { error: addressError } = await supabase
    .from('property_addresses')
    .insert({
      lead_id: leadId,
      address: lead.propertyAddress
    });
  
  if (addressError) {
    console.error('Error creating property address:', addressError);
    throw addressError;
  }
  
  return {
    id: leadId,
    ...lead,
    projectId,
    createdAt: new Date().toISOString(),
    propertyAddresses: [{ id: uuidv4(), address: lead.propertyAddress }],
    messages: []
  };
}

export async function updateLead(id: string, leadUpdate: Partial<Lead>) {
  // Update the main lead record
  const { error: leadError } = await supabase
    .from('leads')
    .update({
      name: leadUpdate.name,
      urgency: leadUpdate.urgency,
      next_action: leadUpdate.nextAction,
      assignee: leadUpdate.assignee,
      close_date: leadUpdate.closeDate,
      status: leadUpdate.status,
      notes: leadUpdate.notes,
      email: leadUpdate.email,
      phone: leadUpdate.phone,
      referrer_source: leadUpdate.referrerSource
    })
    .eq('id', id);
  
  if (leadError) {
    console.error('Error updating lead:', leadError);
    throw leadError;
  }
  
  return true;
}

export async function deleteLead(id: string) {
  // Delete the lead (property addresses and messages will cascade delete)
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
  
  return true;
}

export async function moveLeadStatus(id: string, newStatus: Status) {
  const { error } = await supabase
    .from('leads')
    .update({ status: newStatus })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
  
  return true;
}

export async function addPropertyAddress(leadId: string, address: string) {
  const { error } = await supabase
    .from('property_addresses')
    .insert({
      lead_id: leadId,
      address
    });
  
  if (error) {
    console.error('Error adding property address:', error);
    throw error;
  }
  
  return true;
}

export async function removePropertyAddress(leadId: string, addressId: string) {
  const { error } = await supabase
    .from('property_addresses')
    .delete()
    .eq('id', addressId);
  
  if (error) {
    console.error('Error removing property address:', error);
    throw error;
  }
  
  return true;
}

export async function addMessage(leadId: string, message: Omit<Message, 'id' | 'timestamp' | 'read'>) {
  const { error } = await supabase
    .from('messages')
    .insert({
      lead_id: leadId,
      content: message.content,
      sender: message.sender
    });
  
  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }
  
  return true;
}

export async function markMessageAsRead(leadId: string, messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);
  
  if (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
  
  return true;
}

// Helper function to transform a lead from DB format to app format
function transformLeadFromDB(dbLead: any): Lead {
  return {
    id: dbLead.id,
    name: dbLead.name,
    propertyAddresses: dbLead.property_addresses.map((pa: any) => ({
      id: pa.id,
      address: pa.address
    })),
    urgency: dbLead.urgency,
    nextAction: dbLead.next_action,
    assignee: dbLead.assignee,
    closeDate: dbLead.close_date,
    status: dbLead.status as Status,
    notes: dbLead.notes,
    email: dbLead.email,
    phone: dbLead.phone,
    createdAt: dbLead.created_at,
    referrerSource: dbLead.referrer_source,
    projectId: dbLead.project_id,
    messages: dbLead.messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: msg.timestamp,
      read: msg.read
    }))
  };
}
