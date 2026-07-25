import React from 'react';
import { MapPin } from 'lucide-react';

export const DistanceBadge = ({ distance }) => {
  if (distance === undefined || distance === null) return null;

  const value = Number(distance);
  let colorClass = 'bg-green-500/10 text-green-500 border-green-500/20';

  if (value > 15.0) {
    colorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  } else if (value > 30.0) {
    colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      <MapPin className="w-3.5 h-3.5" />
      <span>{value.toFixed(1)} km away</span>
    </span>
  );
};

export default DistanceBadge;
