import React, { useState } from 'react';
import { useAdminVolunteersQuery, useAdminAssignVolunteerMutation } from '../../hooks/useAdmin.js';
import { Compass, User, Award, ShieldAlert, Check } from 'lucide-react';

export default function VolunteerTable() {
  const { data, isLoading } = useAdminVolunteersQuery();
  const assignMutation = useAdminAssignVolunteerMutation();

  const [activeDeliveryId, setActiveDeliveryId] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  if (isLoading) {
    return <div className="text-white py-10 text-center">Loading volunteers database...</div>;
  }

  const list = data?.data || [];

  const handleManualAssignment = (volunteerId) => {
    if (!activeDeliveryId) return;

    assignMutation.mutate(
      { deliveryId: activeDeliveryId, volunteerId },
      {
        onSuccess: () => {
          setShowAssignDialog(false);
          setActiveDeliveryId('');
        },
      }
    );
  };

  return (
    <div className="w-full flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Redistribution Volunteers</h3>
          <p className="text-xs text-muted-foreground">Total Registered Volunteers: {list.length}</p>
        </div>

        {/* Manual Assign Trigger */}
        <button
          type="button"
          onClick={() => setShowAssignDialog(true)}
          className="px-3.5 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all"
        >
          Manual Override Assign
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No registered volunteers found.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">Volunteer Name</th>
                <th className="px-4 py-3">Online Status</th>
                <th className="px-4 py-3">Vehicle Details</th>
                <th className="px-4 py-3">Operating Bounds</th>
                <th className="px-4 py-3 text-right">Manually Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{v.user?.full_name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">License: {v.driving_license_number || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        v.online_status === 'ONLINE'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : v.online_status === 'BUSY'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {v.online_status || 'OFFLINE'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-foreground">
                    <div>Type: <span className="font-medium text-foreground">{v.vehicle_type || 'N/A'}</span></div>
                    <div className="text-[10px] text-muted-foreground font-medium">No: {v.vehicle_number || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-muted-foreground">
                    Radius: {v.operating_radius || 10} KM
                  </td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2">
                    {showAssignDialog && (
                      <button
                        type="button"
                        onClick={() => handleManualAssignment(v.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                        title="Assign to active delivery"
                      >
                        <Check className="w-3 h-3" /> Select Volunteer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual assignment target delivery select dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 text-foreground shadow-2xl flex flex-col gap-4">
            <h4 className="text-md font-bold text-foreground">Manual Volunteer Overrides Assign</h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Provide Delivery Task ID</label>
              <input
                type="text"
                value={activeDeliveryId}
                onChange={(e) => setActiveDeliveryId(e.target.value)}
                placeholder="Paste Delivery Task UUID here"
                className="bg-background border border-border text-foreground rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              *Paste the delivery task UUID, then select from the list below to overwrite assign.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAssignDialog(false);
                  setActiveDeliveryId('');
                }}
                className="px-4 py-2 text-xs font-bold border border-border rounded-xl text-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
