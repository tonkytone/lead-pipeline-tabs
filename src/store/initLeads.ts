import { useLeadsStore } from './leadsStore';
import { type ActionType, type Status, type Urgency, type ReferrerSource } from '@/types/leads';

export const initSampleLeads = () => {
  const { addLead } = useLeadsStore.getState();

  const sampleLeads = [
    {
      name: 'John Smith',
      propertyAddress: '123 Main St, Anytown, USA',
      urgency: 'hot' as Urgency,
      nextAction: 'Book appraisal' as ActionType,
      assignee: 'Alice Johnson',
      closeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'New' as Status,
      notes: 'Interested in selling their property',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      referrerSource: 'Website' as ReferrerSource
    },
    {
      name: 'Sarah Williams',
      propertyAddress: '456 Oak Ave, Somewhere, USA',
      urgency: 'warm' as Urgency,
      nextAction: 'Prepare listing kit' as ActionType,
      assignee: 'Bob Wilson',
      closeDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Qualifying' as Status,
      notes: 'Looking to downsize',
      email: 'sarah.w@example.com',
      phone: '555-987-6543',
      referrerSource: 'Referral' as ReferrerSource
    },
    {
      name: 'Michael Brown',
      propertyAddress: '789 Pine Rd, Nowhere, USA',
      urgency: 'cold' as Urgency,
      nextAction: 'Send listing kit' as ActionType,
      assignee: 'Alice Johnson',
      closeDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Engaged' as Status,
      notes: 'Investment property',
      email: 'm.brown@example.com',
      phone: '555-456-7890',
      referrerSource: 'Cold Call' as ReferrerSource
    }
  ];

  // Only add sample leads if the store is empty
  if (useLeadsStore.getState().leads.length === 0) {
    sampleLeads.forEach(lead => addLead(lead));
  }
}; 