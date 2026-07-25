import React from 'react';
import { Clock, ShieldCheck, Truck, HelpCircle, XCircle } from 'lucide-react';

export const RequestTimeline = ({ status, logs = [] }) => {
  const steps = [
    { key: 'PENDING', label: 'Request Submitted', desc: 'NGO requested the listing.' },
    { key: 'APPROVED', label: 'Request Approved', desc: 'Donor approved the redistribution request.' },
    { key: 'ASSIGNED', label: 'Volunteer Assigned', desc: 'A volunteer has accepted the delivery.' },
    { key: 'PICKED_UP', label: 'In Transit', desc: 'Volunteer has picked up the surplus food.' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Food reached NGO location successfully.' },
  ];

  const getStatusIndex = (currentStatus) => {
    if (currentStatus === 'CANCELLED') return -1;
    return steps.findIndex((s) => s.key === currentStatus);
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-foreground">📦 Delivery & Claims Progress</h3>

      {status === 'CANCELLED' ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-bold text-sm">Request Cancelled</span>
            <p className="text-xs mt-0.5">This food claim request was cancelled and returned to the discovery pool.</p>
          </div>
        </div>
      ) : (
        <div className="relative border-l border-border ml-3 pl-6 space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            let iconColor = 'text-muted-foreground bg-secondary';
            if (isCompleted) iconColor = 'text-primary bg-primary/10 border-primary';
            if (isCurrent) iconColor = 'text-primary bg-primary/10 border-primary ring-2 ring-primary/20';

            return (
              <div key={step.key} className="relative group">
                {/* Status Dot/Icon */}
                <span className={`absolute -left-9 top-0.5 rounded-full border border-border w-6 h-6 flex items-center justify-center text-xs transition-all ${iconColor}`}>
                  {idx + 1}
                </span>

                {/* Content */}
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold transition-colors ${isCompleted ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">{step.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestTimeline;
