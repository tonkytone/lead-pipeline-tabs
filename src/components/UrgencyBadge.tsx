
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { type Urgency } from '@/types/leads';

interface UrgencyBadgeProps {
  urgency: Urgency;
}

const UrgencyBadge = ({ urgency }: UrgencyBadgeProps) => {
  const badgeStyles = {
    hot: 'bg-hot text-white hover:bg-hot/80',
    warm: 'bg-warm text-white hover:bg-warm/80',
    cold: 'bg-cold text-white hover:bg-cold/80'
  };

  return (
    <Badge className={`${badgeStyles[urgency]}`}>
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
    </Badge>
  );
};

export default UrgencyBadge;
