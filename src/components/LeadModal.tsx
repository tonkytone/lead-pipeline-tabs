import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLeadsStore } from '@/store/leadsStore';
import { type Lead, type Urgency, type ActionType, type Status, type ReferrerSource } from '@/types/leads';
import { Plus, X } from 'lucide-react';

interface LeadModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

const actionOptions: ActionType[] = [
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

const referrerOptions: ReferrerSource[] = [
  "Website",
  "Referral",
  "Walk-in",
  "Cold Call",
  "Social Media",
  "Marketing Campaign",
  "Online Listing",
  "Other",
  "Ailo"
];

const LeadModal: React.FC<LeadModalProps> = ({ lead, open, onClose }) => {
  const { toast } = useToast();
  const { updateLead } = useLeadsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead> | null>(null);
  const [additionalAddresses, setAdditionalAddresses] = useState<string[]>([]);

  React.useEffect(() => {
    if (lead) {
      setFormData(lead);
      setAdditionalAddresses([]);
    }
  }, [lead]);

  if (!lead || !formData) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData) {
      updateLead(lead.id, formData);
      
      toast({
        title: "Lead updated",
        description: "Lead has been updated successfully",
      });
      
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(lead);
    setAdditionalAddresses([]);
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Lead Details
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Lead Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter lead name"
              disabled={!isEditing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property Address</Label>
            <Input 
              id="propertyAddress" 
              value={formData.propertyAddresses?.[0]?.address || ''}
              onChange={(e) => {
                const updatedAddresses = formData.propertyAddresses ? [...formData.propertyAddresses] : [];
                if (updatedAddresses.length > 0) {
                  updatedAddresses[0] = { ...updatedAddresses[0], address: e.target.value };
                } else {
                  updatedAddresses.push({ id: Date.now().toString(), address: e.target.value });
                }
                setFormData(prev => prev ? { ...prev, propertyAddresses: updatedAddresses } : null);
              }}
              placeholder="Enter property address"
              disabled={!isEditing}
            />
          </div>
          
          {formData.propertyAddresses?.slice(1).map((address, index) => (
            <div key={address.id} className="flex space-x-2">
              <Input
                value={address.address}
                onChange={(e) => {
                  const updated = [...formData.propertyAddresses];
                  updated[index + 1] = { ...address, address: e.target.value };
                  setFormData(prev => prev ? { ...prev, propertyAddresses: updated } : null);
                }}
                placeholder="Enter additional property address"
                disabled={!isEditing}
              />
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const updated = formData.propertyAddresses.filter((_, i) => i !== index + 1);
                    setFormData(prev => prev ? { ...prev, propertyAddresses: updated } : null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {isEditing && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => setFormData(prev => prev ? { ...prev, propertyAddresses: [...prev.propertyAddresses, { id: Date.now().toString(), address: '' }] } : null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Property Address
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email"
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone"
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Urgency</Label>
            <RadioGroup 
              value={formData.urgency}
              onValueChange={(value) => handleChange('urgency', value)}
              className="flex space-x-4"
              disabled={!isEditing}
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
              value={formData.referrerSource || ''}
              onValueChange={(value) => handleChange('referrerSource', value)}
              disabled={!isEditing}
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
              disabled={!isEditing}
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
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {['New', 'Qualifying', 'Engaged', 'Presented', 'Signed', 'Won', 'To Nurture', 'Lost'].map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
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
              placeholder="Enter assignee"
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="closeDate">Close Date</Label>
            <Input 
              id="closeDate" 
              type="date"
              value={formData.closeDate.split('T')[0]}
              onChange={(e) => handleChange('closeDate', new Date(e.target.value).toISOString())}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter notes"
              disabled={!isEditing}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal; 