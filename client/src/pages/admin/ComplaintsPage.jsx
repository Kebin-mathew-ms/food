import React, { useState } from 'react';
import { useAdminComplaintsQuery, useAdminResolveComplaintMutation } from '../../hooks/useAdmin.js';
import { AlertOctagon, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export default function ComplaintsPage() {
  const [filter, setFilter] = useState('PENDING');
  const { data, isLoading } = useAdminComplaintsQuery(filter);
  const resolveMutation = useAdminResolveComplaintMutation();

  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading complaints tickets...</div>
      </div>
    );
  }

  const list = data?.data || [];

  const handleResolve = () => {
    if (!activeTicket || !replyText) return;
    resolveMutation.mutate(
      { id: activeTicket.id, status: 'RESOLVED', responseText: replyText },
      {
        onSuccess: () => {
          setActiveTicket(null);
          setReplyText('');
        },
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 text-foreground">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-primary" /> User Complaints Resolver
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Resolve feedback logs and coordinate support responses directly to users.
          </p>
        </div>

        <div className="flex gap-2">
          {['PENDING', 'RESOLVED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                filter === st
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List Cards */}
      {list.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground text-sm">
          No complaints registered matching status: {filter}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground text-base">{c.subject}</h4>
                  <span className="text-[10px] text-muted-foreground">From User: {c.user?.full_name || 'N/A'}</span>
                </div>

                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                    c.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 animate-pulse'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <p className="text-xs text-foreground bg-muted/30 p-3 rounded-xl border border-border leading-relaxed">
                {c.description}
              </p>

              {c.admin_response && (
                <div className="text-xs text-primary bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <strong>Support Response:</strong> {c.admin_response}
                </div>
              )}

              {c.status === 'PENDING' && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTicket(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Submit Response
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution response popup */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 text-foreground shadow-2xl flex flex-col gap-4">
            <h4 className="text-md font-bold text-foreground">Reply to Support Ticket: "{activeTicket.subject}"</h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Response Comments</label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type details resolved message to user..."
                className="bg-background border border-border text-foreground rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTicket(null);
                  setReplyText('');
                }}
                className="px-4 py-2 text-xs font-bold border border-border rounded-xl text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                className="px-4 py-2 text-xs font-bold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                Resolve Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
