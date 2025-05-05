import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { useLeadsStore } from '@/store/leadsStore';
import { type Status, type Lead } from '@/types/leads';
import NewLeadForm from './NewLeadForm';
import LeadModal from './LeadModal';
import { useNavigate } from 'react-router-dom';

const LeadsTableView = () => {
  const { leads } = useLeadsStore();
  const navigate = useNavigate();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isNewLeadFormOpen, setIsNewLeadFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [nurtureSortAsc, setNurtureSortAsc] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const columns: { status: Status; color: string }[] = [
    { status: 'New', color: 'bg-kanban-new' },
    { status: 'Qualifying', color: 'bg-kanban-qualifying' },
    { status: 'Engaged', color: 'bg-kanban-engaged' },
    { status: 'Presented', color: 'bg-kanban-presented' },
    { status: 'Signed', color: 'bg-kanban-signed' },
    { status: 'Won', color: 'bg-kanban-won' },
    { status: 'To Nurture', color: 'bg-kanban-nurture' },
    { status: 'Lost', color: 'bg-kanban-lost' }
  ];

  const getLeadsByStatus = (status: Status) => {
    return leads.filter(lead => lead.status === status);
  };

  const handleSelectAll = (checked: boolean, status: Status) => {
    const leadsInStatus = getLeadsByStatus(status);
    if (checked) {
      setSelectedLeads(prev => [...prev, ...leadsInStatus.map(lead => lead.id)]);
    } else {
      setSelectedLeads(prev => prev.filter(id => !leadsInStatus.some(lead => lead.id === id)));
    }
  };

  const handleSelectLead = (checked: boolean, leadId: string) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const filteredLeads = (status: Status) => {
    let filtered = getLeadsByStatus(status);
    
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.propertyAddresses?.[0]?.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterAssignee && filterAssignee !== 'all') {
      filtered = filtered.filter(lead => lead.assignee === filterAssignee);
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      filtered = filtered.filter(lead => {
        const closeDate = new Date(lead.closeDate).getTime();
        return closeDate >= start && closeDate <= end;
      });
    }
    
    return filtered;
  };

  const uniqueAssignees = Array.from(new Set(leads.map(lead => lead.assignee)));

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  // Helper to get last engagement date from messages
  const getLastEngagementDate = (lead: Lead) => {
    const msgs = lead.messages;
    if (!msgs || msgs.length === 0) return '—';
    const ts = msgs[msgs.length - 1].timestamp;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Bulk action for nurture leads
  const handleBulkSendAiloMail = () => {
    const nurtureLeads = filteredLeads('To Nurture');
    const selectedNurtureLeads = nurtureLeads.filter(lead => selectedLeads.includes(lead.id));
    console.log('Sending Ailo Mail to:', selectedNurtureLeads.map(l => l.name));
  };

  return (
    <div className="h-full flex flex-col bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Property Lead Pipeline</h1>
        <Button className="bg-primary text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-dark" onClick={() => setIsNewLeadFormOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Create New Lead
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-48 border border-gray-300 rounded-md">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {uniqueAssignees.map(assignee => (
              <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="New" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-8">
            {columns.map(({ status, color }) => (
              <TabsTrigger key={status} value={status} className="flex items-center gap-2 text-gray-600 hover:text-primary">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                {status} ({filteredLeads(status).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {columns.map(({ status }) => (
            <TabsContent key={status} value={status} className="flex-1 overflow-auto mt-0">
              {status === 'To Nurture' && (
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="flex space-x-2">
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" className="border border-gray-300 rounded-md" />
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" className="border border-gray-300 rounded-md" />
                  </div>
                  <Select value={nurtureSortAsc ? 'asc' : 'desc'} onValueChange={v => setNurtureSortAsc(v === 'asc')}>
                    <SelectTrigger className="w-48 border border-gray-300 rounded-md">
                      <SelectValue placeholder="Sort Next Engage Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Next Engage Date Ascending</SelectItem>
                      <SelectItem value="desc">Next Engage Date Descending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="border border-gray-300 text-gray-600 hover:bg-gray-100" disabled={!filteredLeads(status).some(lead => selectedLeads.includes(lead.id))} onClick={handleBulkSendAiloMail}>
                    Send Ailo Mail
                  </Button>
                </div>
              )}
              <div className="rounded-md border border-gray-200">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      {status === 'To Nurture' ? (
                        <>
                          <TableHead className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Checkbox
                              checked={filteredLeads(status).every(lead => selectedLeads.includes(lead.id))}
                              onCheckedChange={(checked) => handleSelectAll(checked as boolean, status)}
                            />
                          </TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Address</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Engagement Date</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Engage Date</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Checkbox
                              checked={filteredLeads(status).every(lead => selectedLeads.includes(lead.id))}
                              onCheckedChange={(checked) => handleSelectAll(checked as boolean, status)}
                            />
                          </TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Address</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Action</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</TableHead>
                          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {(status === 'To Nurture'
                      ? [...filteredLeads(status)].sort((a, b) =>
                          nurtureSortAsc
                            ? new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime()
                            : new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime()
                        )
                      : filteredLeads(status)
                    ).map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-gray-50">
                        {status === 'To Nurture' ? (
                          <>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <Checkbox
                                checked={selectedLeads.includes(lead.id)}
                                onCheckedChange={(checked) => handleSelectLead(checked as boolean, lead.id)}
                              />
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:underline" onClick={() => handleLeadClick(lead)}>
                              {lead.name}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap cursor-pointer hover:underline" onClick={() => handleLeadClick(lead)}>
                              {lead.propertyAddresses?.[0]?.address || 'No address'}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              {getLastEngagementDate(lead)}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              {new Date(lead.closeDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">{lead.assignee}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <Checkbox
                                checked={selectedLeads.includes(lead.id)}
                                onCheckedChange={(checked) => handleSelectLead(checked as boolean, lead.id)}
                              />
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:underline" onClick={() => handleLeadClick(lead)}>
                              {lead.name}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap cursor-pointer hover:underline" onClick={() => handleLeadClick(lead)}>
                              {lead.propertyAddresses?.[0]?.address || 'No address'}
                              {lead.propertyAddresses?.length > 1 && ` +${lead.propertyAddresses.length - 1} more`}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/project/${lead.id}`)}>
                              {lead.nextAction}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">{lead.assignee}</TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              {new Date(lead.closeDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <div className={`w-2 h-2 rounded-full ${
                                lead.urgency === 'hot' ? 'bg-hot' :
                                lead.urgency === 'warm' ? 'bg-warm' : 'bg-cold'
                              }`} />
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <NewLeadForm 
        open={isNewLeadFormOpen}
        onClose={() => setIsNewLeadFormOpen(false)}
      />

      <LeadModal
        lead={selectedLead}
        open={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setSelectedLead(null);
        }}
      />
    </div>
  );
};

export default LeadsTableView; 