
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeadsStore } from '@/store/leadsStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus, Mail, Send } from 'lucide-react';

const Messages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const leads = useLeadsStore(state => state.leads);
  const addMessage = useLeadsStore(state => state.addMessage);
  const markMessageAsRead = useLeadsStore(state => state.markMessageAsRead);
  
  const lead = leads.find(lead => lead.id === id);
  const [newMessage, setNewMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState('messages');

  // Mark all unread messages as read when viewing this page
  React.useEffect(() => {
    if (lead) {
      lead.messages.forEach(message => {
        if (!message.read) {
          markMessageAsRead(lead.id, message.id);
        }
      });
    }
  }, [lead, markMessageAsRead]);
  
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold mb-4">Lead not found</h1>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    addMessage(lead.id, {
      content: newMessage,
      sender: lead.assignee,
      read: true
    });
    
    setNewMessage('');
  };

  return (
    <div className="container py-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center" 
          onClick={() => navigate(`/project/${id}`)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Project
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
      
      <div className="border rounded-lg">
        <Tabs 
          defaultValue="messages" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger 
                value="actions"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"
                onClick={() => navigate(`/project/${id}`)}
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
          
          <TabsContent value="messages" className="p-4 m-0">
            {lead.messages.length > 0 ? (
              <div className="space-y-4 mb-6">
                {lead.messages.map(message => (
                  <div key={message.id} className="border rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2">
                        {message.sender.substring(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium">{message.sender}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="ml-10">{message.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 mb-6">
                <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center mb-6">
                  <Mail size={40} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                <p className="text-gray-500 text-center max-w-sm">
                  Send a message or link a message to this project
                </p>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="flex items-start space-x-2">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs mt-2">
                  {lead.assignee.substring(0, 2).toUpperCase()}
                </span>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a message..."
                    className="mb-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
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
  );
};

export default Messages;
