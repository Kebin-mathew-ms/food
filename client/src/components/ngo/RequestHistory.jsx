import React from 'react';
import { Calendar, Eye, ShieldCheck, HelpCircle } from 'lucide-react';

export const RequestHistory = ({ requests = [], onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'APPROVED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ASSIGNED':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'PICKED_UP':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-primary" /> Claims History List
        </h3>
        <span className="text-xs text-muted-foreground font-semibold">{requests.length} Requests Total</span>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No food claim requests found. Start by claiming available donations.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {requests.map((item) => (
            <div key={item.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground truncate">
                    {item.donation?.food_name || 'Surplus Food'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(item.request_status)}`}>
                    {item.request_status}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                  <span>Requested on: {new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="block truncate">
                    Pickup: {new Date(item.expected_pickup_time).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewDetails(item.id)}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors flex-shrink-0"
                title="View Claim Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
