import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { useLeadsStore } from '@/store/leadsStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NewLeadForm from './NewLeadForm';
import { type Status } from '@/types/leads';

const KanbanBoard = () => {
  const { leads, moveLeadStatus } = useLeadsStore();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isNewLeadFormOpen, setIsNewLeadFormOpen] = useState(false);
  
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
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    console.log('handleDrop triggered with status:', status);
    if (draggedItemId) {
      console.log('Moving lead with ID:', draggedItemId, 'to status:', status);
      moveLeadStatus(draggedItemId, status);
      setDraggedItemId(null);
    }
  };
  
  const getLeadsByStatus = (status: Status) => {
    return leads.filter(lead => lead.status === status);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
        <h1 className="text-2xl font-semibold">Property Lead Pipeline</h1>
        <Button onClick={() => setIsNewLeadFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Lead
        </Button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 pb-6 h-full">
          {columns.map(({ status, color }) => (
            <KanbanColumn 
              key={status}
              title={status}
              leads={getLeadsByStatus(status)}
              color={color}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
      
      <NewLeadForm 
        open={isNewLeadFormOpen}
        onClose={() => setIsNewLeadFormOpen(false)}
      />
    </div>
  );
};

export default KanbanBoard;
