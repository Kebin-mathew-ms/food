import React, { useState } from 'react';
import { useAdminNgosQuery, useAdminUpdateNgoStatusMutation } from '../../hooks/useAdmin.js';
import { Check, X, ShieldAlert, Eye, Download } from 'lucide-react';

export default function NGOTable() {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const { data, isLoading } = useAdminNgosQuery(statusFilter);
  const updateStatus = useAdminUpdateNgoStatusMutation();

  const [activeNgo, setActiveNgo] = useState(null); // Selected NGO for remarks dialog
  const [remarks, setRemarks] = useState('');

  if (isLoading) {
    return <div className="text-white py-10 text-center">Loading NGO database lists...</div>;
  }

  const list = data?.data || [];

  const handleAction = (id, status) => {
    updateStatus.mutate(
      { id, status, remarks },
      {
        onSuccess: () => {
          setActiveNgo(null);
          setRemarks('');
        },
      }
    );
  };

  return (
    <div className="w-full flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm">
      {/* Filters Header bar */}
      <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">NGO Credentials Verification</h3>
          <p className="text-xs text-muted-foreground">Total NGOs found: {list.length}</p>
        </div>

        <div className="flex gap-2">
          {['PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                statusFilter === st
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* NGOs list */}
      {list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No organizations found under this status.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">Organization Name</th>
                <th className="px-4 py-3">Reg. Number</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Approvals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((n) => (
                <tr key={n.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4 font-semibold text-foreground">{n.organization_name}</td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">{n.registration_number}</td>
                  <td className="px-4 py-4 flex gap-3 text-primary text-xs mt-1.5">
                    {n.registration_certificate ? (
                      <a href={n.registration_certificate} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline font-medium">
                        <Eye className="w-3.5 h-3.5" /> Certificate
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No Cert</span>
                    )}
                    {n.ngo_license ? (
                      <a href={n.ngo_license} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline font-medium">
                        <Download className="w-3.5 h-3.5" /> License
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                        n.status === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : n.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2">
                    {n.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveNgo({ id: n.id, action: 'VERIFIED' })}
                          className="p-1.5 rounded-lg border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                          title="Verify NGO"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNgo({ id: n.id, action: 'REJECTED' })}
                          className="p-1.5 rounded-lg border border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                          title="Reject NGO"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {n.status === 'VERIFIED' && (
                      <button
                        type="button"
                        onClick={() => handleAction(n.id, 'SUSPENDED')}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        title="Suspend NGO"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Remarks overlay modal dialog */}
      {activeNgo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 text-foreground shadow-2xl flex flex-col gap-4">
            <h4 className="text-md font-bold text-foreground">
              NGO Verification: {activeNgo.action === 'VERIFIED' ? 'Approve Registration' : 'Reject Request'}
            </h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Provide Remarks/Reasons</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Compliance checklist verification complete."
                className="bg-background border border-border text-foreground rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveNgo(null)}
                className="px-4 py-2 text-xs font-bold border border-border rounded-xl text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction(activeNgo.id, activeNgo.action)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border ${
                  activeNgo.action === 'VERIFIED'
                    ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                    : 'bg-rose-600 border-rose-500 text-white hover:bg-rose-500'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
