import { useEffect } from 'react';
import LeadsTableView from "@/components/LeadsTableView";
import { initSampleLeads } from '@/store/initLeads';

const Index = () => {
  useEffect(() => {
    initSampleLeads();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <LeadsTableView />
    </div>
  );
};

export default Index;
