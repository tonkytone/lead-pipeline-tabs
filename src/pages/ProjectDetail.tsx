import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { type Lead, type ActionType, type Status, type Urgency, type ReferrerSource } from '@/types/leads';
import { useLeadsStore } from '@/store/leadsStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const leads = useLeadsStore(state => state.leads);
  const { updateLead } = useLeadsStore();
  const lead = leads.find(lead => lead.id === id);
  const { toast } = useToast();
  const [formData, setFormData] = useState<Lead | null>(lead);
  React.useEffect(() => { if (lead) setFormData(lead); }, [lead]);
  const handleChange = (field: keyof Lead, value: any) => { setFormData(prev => prev ? { ...prev, [field]: value } : prev); };
  const handleAddressChange = (index: number, value: string) => {
    if (!formData) return;
    const addrs = [...formData.propertyAddresses];
    addrs[index] = { ...addrs[index], address: value };
    setFormData({ ...formData, propertyAddresses: addrs });
  };
  const handleAddPropertyAddress = () => {
    if (!formData) return;
    const newAddresses = [...formData.propertyAddresses, { id: Date.now().toString(), address: '' }];
    setFormData({ ...formData, propertyAddresses: newAddresses });
  };
  const statusOptions: Status[] = [
    'New','Qualifying','Engaged','Presented','Signed','Won','To Nurture','Lost'
  ];
  const actionOptions: ActionType[] = [
    'Send introductory info','Make a follow-up phone call','Reminder','Qualify',
    'Book appraisal','Prepare listing kit','Send listing kit','Hold appraisal meeting',
    'Enter new management details','Create management agreement','Send agreement for signing',
    'Request Signature','Confirm signing','Upload signed agreement',
    'Verify property ownership and investor IDs','Finalise opportunity'
  ];
  const referrerOptions: ReferrerSource[] = [
    'Website','Referral','Walk-in','Cold Call','Social Media','Marketing Campaign','Online Listing','Other','Ailo'
  ];
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      updateLead(formData.id, formData);
      toast({ title: 'Saved', description: 'Lead updated.' });
    }
  };
  
  // Define the full list of actions and their editable statuses
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
  const [actionStatuses, setActionStatuses] = useState<Record<ActionType, 'pending' | 'completed' | 'skipped'>>(() => {
    const nextIdx = actionsOrder.findIndex(a => a === lead!.nextAction);
    const init: Record<ActionType, 'pending' | 'completed' | 'skipped'> = {} as any;
    actionsOrder.forEach((action, idx) => {
      init[action] = idx <= nextIdx ? 'completed' : 'pending';
    });
    return init;
  });
  const toggleStatus = (action: ActionType) => {
    setActionStatuses(prev => {
      const current = prev[action];
      const next: 'pending' | 'completed' | 'skipped' =
        current === 'pending' ? 'completed' : current === 'completed' ? 'skipped' : 'pending';
      return { ...prev, [action]: next };
    });
  };
  
  const [activeTab, setActiveTab] = useState('actions');
  const [summary, setSummary] = useState('');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [showLostForm, setShowLostForm] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [lostDate, setLostDate] = useState('');
  
  // Helper to generate slug IDs for actions
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');
  
  // Generate AI summary
  React.useEffect(() => {
    if (formData) {
      const completedActions = actionsOrder.filter(a => actionStatuses[a] === 'completed');
      const { name, status, urgency, notes } = formData;
      const count = completedActions.length;
      // Build summary including lead info and notes
      let summaryText = `Lead ${name} (Status: ${status}, Urgency: ${urgency})`;
      if (notes) {
        summaryText += `, Notes: ${notes}`;
      }
      summaryText += `. Completed ${count} action${count !== 1 ? 's' : ''}`;
      if (count > 0) {
        summaryText += `: ${completedActions.join(', ')}`;
      }
      summaryText += `.`;
      setSummary(summaryText);
    }
  }, [formData, actionStatuses]);
  
  // Handler to mark the lead as Lost
  const handleMarkLost = () => {
    if (formData && lostDate) {
      console.log('Marking lead as lost with ID:', formData.id);
      const updated: Lead = {
        ...formData,
        status: 'To Nurture',
        closeDate: new Date(lostDate).toISOString(),
        notes: `${formData.notes || ''}${formData.notes ? '\n' : ''}Lost reason: ${lostReason}`
      };
      console.log('Updated lead data:', updated);
      updateLead(formData.id, updated);
      setFormData(updated);
      toast({ title: 'Marked as Lost', description: 'Lead moved to To Nurture.' });
      setShowLostForm(false);
    }
  };
  
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold mb-4">Lead not found</h1>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }
  
  const formattedDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Safely get property addresses
  const propertyAddressText = lead.propertyAddresses && lead.propertyAddresses.length > 0 
    ? lead.propertyAddresses.map(pa => pa.address).join(', ')
    : 'No address';

  return (
    <div className="min-h-screen container py-8 max-w-5xl mx-auto overflow-y-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-600 hover:text-primary" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Dashboard
        </Button>
        <div className="flex space-x-4">
          <Button variant="outline" className="border border-gray-300 text-gray-600 hover:bg-gray-100">Edit</Button>
          <Button variant="outline" className="border border-gray-300 text-gray-600 hover:bg-gray-100">•••</Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <form onSubmit={handleSave} className="space-y-4 mb-6 flex-1">
          <div>
            <Label className="text-gray-700">Name</Label>
            <Input value={formData?.name||''} onChange={e=>handleChange('name', e.target.value)} className="border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div>
            <Label className="text-gray-700">Property Addresses</Label>
            {formData?.propertyAddresses.map((pa, idx) => (
              <Input
                key={pa.id}
                className="mb-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={pa.address}
                onChange={e=>handleAddressChange(idx, e.target.value)}
              />
            ))}
          </div>
          <Button type="button" variant="outline" className="w-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100" onClick={handleAddPropertyAddress}>
            <Plus className="h-5 w-5 mr-2" />
            Add Another Property Address
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData?.email||''} onChange={e=>handleChange('email', e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData?.phone||''} onChange={e=>handleChange('phone', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Urgency</Label>
              <RadioGroup
                value={formData?.urgency}
                onValueChange={v=>handleChange('urgency', v)}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="hot" id="hot" />
                  <Label htmlFor="hot">Hot</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="warm" id="warm" />
                  <Label htmlFor="warm">Warm</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="cold" id="cold" />
                  <Label htmlFor="cold">Cold</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Referrer Source</Label>
              <Select value={formData?.referrerSource||''} onValueChange={v=>handleChange('referrerSource', v)}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  {referrerOptions.map(src=> <SelectItem key={src} value={src}>{src}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Assignee</Label>
              <Input value={formData?.assignee||''} onChange={e=>handleChange('assignee', e.target.value)} />
            </div>
            <div>
              <Label>Close Date</Label>
              <Input type="date" value={formData?.closeDate.split('T')[0]||''} onChange={e=>handleChange('closeDate', new Date(e.target.value).toISOString())} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={formData?.notes||''} onChange={e=>handleChange('notes', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label>Status</Label>
              <Select value={formData?.status || ''} disabled>
                <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
        
        <div className="border rounded-lg flex-1">
          {/* AI Summary Section */}
          <div className="p-4 border-b">
            <p className="text-sm text-gray-700">
              {isSummaryExpanded ? summary : summary.slice(0, 400) + (summary.length > 400 ? '...' : '')}
            </p>
            {summary.length > 400 && (
              <Button variant="link" size="sm" onClick={() => setIsSummaryExpanded(prev => !prev)}>
                {isSummaryExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
            {/* Suggested next action link */}
            {formData?.nextAction && (
              <p className="mt-2 text-sm">
                Suggested next action:{' '}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => {
                    setActiveTab('actions');
                    const id = `action-${slugify(formData.nextAction)}`;
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {formData.nextAction}
                </button>
              </p>
            )}
          </div>
          <Tabs 
            defaultValue="actions" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger 
                  value="actions"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"
                >
                  Actions
                  <Badge className="ml-2 bg-primary h-6 w-6 rounded-full p-0 flex items-center justify-center">5</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="messages"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"
                >
                  Messages
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"
                >
                  Activity
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="actions" className="p-4 m-0 overflow-y-auto max-h-96">
              <div className="flex justify-end mb-4">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create action
                </Button>
              </div>
              <div className="space-y-4">
                {actionsOrder.map(action => (
                  <div key={action} className="border rounded-md p-4 flex flex-col">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 mr-4 rounded-full flex items-center justify-center cursor-pointer"
                        onClick={() => toggleStatus(action)}
                      >
                        {actionStatuses[action] === 'completed' ? (
                          <span className="bg-green-100 text-green-700 w-full h-full flex items-center justify-center">✓</span>
                        ) : actionStatuses[action] === 'skipped' ? (
                          <span className="bg-gray-200 text-gray-700 w-full h-full flex items-center justify-center">—</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 w-full h-full flex items-center justify-center">○</span>
                        )}
                      </div>
                      <p className="flex-1 font-medium">{action}</p>
                      {action === 'Finalise opportunity' && (
                        <button
                          type="button"
                          className="text-destructive underline ml-4"
                          onClick={() => setShowLostForm(prev => !prev)}
                        >Mark as Lost</button>
                      )}
                    </div>
                    {action === 'Finalise opportunity' && showLostForm && (
                      <div className="mt-2 ml-12 flex flex-col space-y-2">
                        <div>
                          <Label>Next Engage Date</Label>
                          <Input type="date" value={lostDate} onChange={e => setLostDate(e.target.value)} />
                        </div>
                        <div>
                          <Label>Reason</Label>
                          <Input value={lostReason} onChange={e => setLostReason(e.target.value)} placeholder="Enter reason for lost" />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleMarkLost}>Save</Button>
                          <Button variant="outline" onClick={() => setShowLostForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="messages" className="p-4 m-0">
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center mb-6">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="80" height="80" rx="40" fill="#E9ECEF"/>
                    <path d="M52 36H28V50H52V36Z" stroke="#4C6EF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M28 36L40 44L52 36" stroke="#4C6EF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                <p className="text-gray-500 text-center max-w-sm mb-6">
                  Send a message or link a message to this project
                </p>
                <Button>Send a message</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="p-4 m-0">
              <div className="flex flex-col items-center justify-center py-16">
                <p>Activity log will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Files</h2>
        <div className="border border-dashed rounded-lg p-10 flex flex-col items-center justify-center">
          <div className="bg-orange-100 p-4 rounded-lg mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L4 10L16 18L28 10L16 2Z" fill="#FFC107"/>
              <path d="M28 10V22L16 30L4 22V10" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Drag and drop files here or</p>
          <Button variant="outline" className="text-primary">add file</Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
