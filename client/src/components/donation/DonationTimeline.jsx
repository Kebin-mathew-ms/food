import React from 'react';
import { Calendar, CheckCircle2, UserCheck, Truck, Sparkles } from 'lucide-react';

/**
 * Visual timeline progress tracking states for donation items.
 */
export const DonationTimeline = ({ status, createdAt }) => {
  const steps = [
    {
      key: 'CREATED',
      label: 'Listed',
      description: 'Listed on database feed.',
      icon: Calendar,
      isCompleted: true,
      time: new Date(createdAt).toLocaleDateString(),
    },
    {
      key: 'REQUESTED',
      label: 'Requested',
      description: 'Claim requested by NGO.',
      icon: Sparkles,
      isCompleted: ['REQUESTED', 'APPROVED', 'PICKED_UP', 'DELIVERED'].includes(status),
    },
    {
      key: 'APPROVED',
      label: 'Approved',
      description: 'NGO claim request approved.',
      icon: UserCheck,
      isCompleted: ['APPROVED', 'PICKED_UP', 'DELIVERED'].includes(status),
    },
    {
      key: 'PICKED_UP',
      label: 'Picked Up',
      description: 'Collected by volunteer.',
      icon: Truck,
      isCompleted: ['PICKED_UP', 'DELIVERED'].includes(status),
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Distributed successfully.',
      icon: CheckCircle2,
      isCompleted: status === 'DELIVERED',
    },
  ];

  // If donation cancelled or expired, inject alternate status at the end
  if (status === 'CANCELLED') {
    steps.push({
      key: 'CANCELLED',
      label: 'Cancelled',
      description: 'Listing withdrawn by donor.',
      icon: CheckCircle2,
      isCompleted: true,
      isError: true,
    });
  } else if (status === 'EXPIRED') {
    steps.push({
      key: 'EXPIRED',
      label: 'Expired',
      description: 'Listing expired automatically.',
      icon: CheckCircle2,
      isCompleted: true,
      isError: true,
    });
  }

  return (
    <div className="flow-root p-4">
      <ul className="-mb-8">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <li key={step.key}>
              <div className="relative pb-8">
                {idx !== steps.length - 1 && (
                  <span
                    className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                      step.isCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-card ${
                        step.isError
                          ? 'bg-rose-500/10 text-rose-500 ring-rose-500/5'
                          : step.isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                    {step.time && (
                      <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        <time>{step.time}</time>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DonationTimeline;
