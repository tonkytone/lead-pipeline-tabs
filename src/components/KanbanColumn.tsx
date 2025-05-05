import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LeadCard from './LeadCard';
import { type Lead, type Status } from '@/types/leads';

interface KanbanColumnProps {
  title: Status;
  leads: Lead[];
  color: string;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: Status) => void;
}

const KanbanColumn = ({
  title,
  leads,
  color,
  onDragStart,
  onDragOver,
  onDrop
}: KanbanColumnProps) => {
  
  const colorKey = title.replace(/\s+/g, '').toLowerCase();
  const columnColor = color || 'bg-kanban-new';

  return (
    <div className="w-[280px] flex-shrink-0 h-full">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2 pt-4 px-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <h3 className="font-medium">{title}</h3>
            </div>
            <span className="bg-muted text-muted-foreground text-xs font-medium rounded-full px-2 py-0.5">
              {leads.length}
            </span>
          </div>
        </CardHeader>
        <CardContent 
          className="flex-1 overflow-y-auto p-2"
          onDragOver={onDragOver}
          onDrop={(e) => {
            console.log('Drop event triggered for column:', title);
            onDrop(e, title);
          }}
        >
          {leads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onDragStart={onDragStart} 
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanColumn;
