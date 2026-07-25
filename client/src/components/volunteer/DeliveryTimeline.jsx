import React from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'ON_THE_WAY_TO_PICKUP', label: 'On Way to Pickup' },
  { key: 'ARRIVED_AT_PICKUP', label: 'Arrived Pickup' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'ARRIVED_AT_DESTINATION', label: 'Arrived NGO' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function DeliveryTimeline({ currentStatus }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="text-sm font-semibold text-foreground mb-6">Delivery Progress Timeline</div>

      {/* Horizontal timeline view layout */}
      <div className="relative flex justify-between items-center w-full">
        {/* Grey progress track line background */}
        <div className="absolute left-0 right-0 h-1 bg-muted -z-10 rounded-full" />
        
        {/* Active glowing progress connection */}
        {currentIndex >= 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute left-0 h-1 bg-gradient-to-r from-primary to-emerald-500 -z-10 rounded-full"
          />
        )}

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-2">
              {/* Stepper node point */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : isActive
                    ? 'bg-primary border-primary text-white shadow-[0_0_12px_rgba(79,70,229,0.3)]'
                    : 'bg-background border-border text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>

              {/* Responsive title label */}
              <span
                className={`text-[10px] font-medium text-center hidden md:inline-block transition-colors ${
                  isActive ? 'text-primary font-bold' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
