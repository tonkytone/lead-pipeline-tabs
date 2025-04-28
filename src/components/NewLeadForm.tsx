
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLeadsStore } from '@/store/leadsStore';
import { type Urgency, type ActionType, type Status, type ReferrerSource } from '@/types/leads';
import { Plus, X } from "lucide-react";

interface NewLeadFormProps {
  open: boolean;
  onClose: () => void;
}

const actionOptions: ActionType[] = [
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

const referrerOptions: ReferrerSource[] = [
  "Website",
  "Referral",
  "Walk-in",
  "Cold Call",
  "Social Media",
  "Marketing Campaign",
  "Online Listing",
  "Other"
];

const NewLeadForm = ({ open, onClose }: NewLeadFormProps) => {
  const { toast } = useToast();
  const addLead = useLeadsStore(state => state.addLead);
  
  const [formData, setFormData] = useState({
    name: '',
    propertyAddress: '',
    urgency: 'warm' as Urgency,
    nextAction: actionOptions[0],
    assignee: '',
    closeDate: '',
    status: 'New' as Status,
    notes: '',
    email: '',
    phone: '',
    referrerSource: 'Website' as ReferrerSource,
  });

  const [additionalAddresses, setAdditionalAddresses] = useState<string[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAddress = () => {
    setAdditionalAddresses(prev => [...prev, '']);
  };

  const handleChangeAdditionalAddress = (index: number, value: string) => {
    setAdditionalAddresses(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveAddress = (index: number) => {
    setAdditionalAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addLead(formData);
    
    // Add additional addresses if any
    // We'll handle this after lead creation in the store itself
    
    toast({
      title: "Lead created",
      description: "New lead has been created successfully",
    });
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      propertyAddress: '',
      urgency: 'warm' as Urgency,
      nextAction: actionOptions[0],
      assignee: '',
      closeDate: '',
      status: 'New' as Status,
      notes: '',
      email: '',
      phone: '',
      referrerSource: 'Website' as ReferrerSource,
    });
    setAdditionalAddresses([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Lead Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter lead name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property Address</Label>
            <Input 
              id="propertyAddress" 
              value={formData.propertyAddress}
              onChange={(e) => handleChange('propertyAddress', e.target.value)}
              placeholder="Enter property address"
            />
          </div>
          
          {additionalAddresses.map((address, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                value={address}
                onChange={(e) => handleChangeAdditionalAddress(index, e.target.value)}
                placeholder="Enter additional property address"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => handleRemoveAddress(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleAddAddress}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Property Address
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Urgency</Label>
            <RadioGroup 
              defaultValue="warm"
              value={formData.urgency}
              onValueChange={(value) => handleChange('urgency', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hot" id="hot" />
                <Label htmlFor="hot" className="text-hot font-medium">Hot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="warm" id="warm" />
                <Label htmlFor="warm" className="text-warm font-medium">Warm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cold" id="cold" />
                <Label htmlFor="cold" className="text-cold font-medium">Cold</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referrerSource">Referrer Source</Label>
            <Select 
              value={formData.referrerSource}
              onValueChange={(value) => handleChange('referrerSource', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select referrer source" />
              </SelectTrigger>
              <SelectContent>
                {referrerOptions.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nextAction">Next Action</Label>
            <Select 
              value={formData.nextAction}
              onValueChange={(value) => handleChange('nextAction', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select next action" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input 
              id="assignee" 
              value={formData.assignee}
              onChange={(e) => handleChange('assignee', e.target.value)}
              placeholder="Enter assignee name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="closeDate">Close Date</Label>
            <Input 
              id="closeDate" 
              type="date" 
              value={formData.closeDate}
              onChange={(e) => handleChange('closeDate', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLeadForm;
