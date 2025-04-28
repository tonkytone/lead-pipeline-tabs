
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UrgencyBadge from './UrgencyBadge';
import { Calendar } from "lucide-react";
import { type Lead } from '@/types/leads';

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const LeadCard = ({ lead, onDragStart }: LeadCardProps) => {
  const formattedDate = new Date(lead.closeDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <Card 
      className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <h3 className="font-medium text-sm truncate max-w-[170px]">{lead.name}</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lead.propertyAddress}</p>
        </div>
        <UrgencyBadge urgency={lead.urgency} />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-xs mb-2">
          <span className="font-medium">Next action: </span>
          <span>{lead.nextAction}</span>
        </div>
        <div className="text-xs">
          <span className="font-medium">Assignee: </span>
          <span>{lead.assignee}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
