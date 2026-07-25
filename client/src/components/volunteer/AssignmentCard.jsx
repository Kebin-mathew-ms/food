import React from 'react';
import { useAcceptAssignmentMutation, useRejectAssignmentMutation } from '../../hooks/useVolunteer.js';
import CountdownTimer from '../donation/CountdownTimer.jsx';
import { MapPin, ArrowRight, Truck, Ban } from 'lucide-react';

export default function AssignmentCard({ assignment }) {
  const acceptMutation = useAcceptAssignmentMutation();
  const rejectMutation = useRejectAssignmentMutation();

  const request = assignment.donation_request;
  const donation = request?.donation;
  const ngo = request?.ngo;

  return (
    <div className="w-full flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      {/* Header bar */}
      <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            New Delivery Assignment
          </span>
          <h3 className="text-lg font-bold text-foreground">{donation?.food_name || 'Surplus Foods'}</h3>
          <p className="text-xs text-muted-foreground">Category: {donation?.food_category || 'N/A'}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground font-medium">Expires In:</div>
          {donation?.expiry_time && (
            <CountdownTimer expiryTime={donation.expiry_time} />
          )}
        </div>
      </div>

      {/* Transit details */}
      <div className="flex flex-col gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Pickup (Donor)</div>
            <div className="font-semibold text-foreground">{donation?.pickup_address || 'Donor address'}</div>
            <div className="text-xs text-muted-foreground">{donation?.donor?.full_name}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Destination (NGO)</div>
            <div className="font-semibold text-foreground">{ngo?.address || 'NGO address'}</div>
            <div className="text-xs text-muted-foreground">{ngo?.organization_name}</div>
          </div>
        </div>

        {assignment.distance !== undefined && (
          <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border">
            <span>Distance Range:</span>
            <span className="font-bold text-foreground">{assignment.distance.toFixed(1)} km</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => rejectMutation.mutate(assignment.id)}
          disabled={rejectMutation.isPending || acceptMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all"
        >
          <Ban className="w-4 h-4" /> Decline
        </button>
        <button
          type="button"
          onClick={() => acceptMutation.mutate(assignment.id)}
          disabled={acceptMutation.isPending || rejectMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-emerald-600 border border-emerald-500 rounded-xl hover:bg-emerald-500 transition-all shadow-sm"
        >
          <Truck className="w-4 h-4" /> Accept Assignment
        </button>
      </div>
    </div>
  );
}
