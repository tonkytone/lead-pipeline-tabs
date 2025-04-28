
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLeadsStore } from '@/store/leadsStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const leads = useLeadsStore(state => state.leads);
  const lead = leads.find(lead => lead.id === id);
  
  const [activeTab, setActiveTab] = useState('actions');
  
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

  return (
    <div className="container py-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <div className="flex space-x-4">
          <Button variant="outline">Edit</Button>
          <Button variant="outline">•••</Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{lead.name}</h1>
        <div className="inline-block mb-4">
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-full px-4 py-1">
            Open
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-sm font-medium text-gray-500">Opportunity</CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col space-y-1">
              <p className="text-base font-medium">
                {lead.propertyAddresses.map(pa => pa.address).join(', ')}
              </p>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                  {lead.assignee.substring(0, 2).toUpperCase()}
                </span>
                <span>{lead.assignee}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-sm font-medium text-gray-500">Project</CardHeader>
          <CardContent className="pt-0">
            <p className="text-base font-medium">{lead.projectId || 'N/A'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-sm font-medium text-gray-500">Type</CardHeader>
          <CardContent className="pt-0">
            <p className="text-base font-medium">{lead.status} lead</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-sm font-medium text-gray-500">Description</CardHeader>
          <CardContent className="pt-0">
            <p className="text-base font-medium">{lead.notes || '—'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-sm font-medium text-gray-500">Start date</CardHeader>
          <CardContent className="pt-0">
            <p className="text-base font-medium">{formattedDate(lead.createdAt)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-sm font-medium text-gray-500">Due date</CardHeader>
          <CardContent className="pt-0">
            <p className="text-base font-medium">{formattedDate(lead.closeDate)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-sm font-medium text-gray-500">Assignee</CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                {lead.assignee.substring(0, 2).toUpperCase()}
              </span>
              <span>{lead.assignee}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="border rounded-lg">
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
          
          <TabsContent value="actions" className="p-4 m-0">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create action
                </Button>
              </div>
              
              {/* Action items */}
              <div className="space-y-4">
                <div className="border rounded-md p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-4">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Create lead</p>
                    <p className="text-sm text-gray-500">Input</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="ml-2">12 Dec</Badge>
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {lead.assignee.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-4">
                    ○
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Send introductory info</p>
                    <p className="text-sm text-gray-500">Message</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="ml-2">12 Dec</Badge>
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {lead.assignee.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-4">
                    ○
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Make a follow-up phone call</p>
                    <p className="text-sm text-gray-500">Reminder</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="ml-2">12 Dec</Badge>
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {lead.assignee.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-4">
                    ○
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Profile</p>
                    <p className="text-sm text-gray-500">Input</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="ml-2">12 Dec</Badge>
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {lead.assignee.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-4">
                    ○
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Qualify</p>
                    <p className="text-sm text-gray-500">Qualify</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="ml-2">12 Dec</Badge>
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {lead.assignee.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
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
