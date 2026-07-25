import React from 'react';
import { Download } from 'lucide-react';

export default function DeliveryHistory({ history = [] }) {
  const exportToCSV = () => {
    if (history.length === 0) return;

    const headers = ['Delivery ID', 'Food Item', 'Donor', 'NGO Destination', 'Status', 'Completed Time'];
    const rows = history.map((item) => {
      const donation = item.donation_request?.donation;
      const ngo = item.donation_request?.ngo;
      return [
        item.id,
        donation?.food_name || 'N/A',
        donation?.pickup_address || 'N/A',
        ngo?.organization_name || 'N/A',
        item.delivery_status,
        item.completion_time ? new Date(item.completion_time).toLocaleString() : 'N/A',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `volunteer_delivery_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Redistribution History Log</h3>
          <p className="text-xs text-muted-foreground">Total Deliveries: {history.length}</p>
        </div>
        <button
          type="button"
          onClick={exportToCSV}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No historical deliveries registered.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">Food Item</th>
                <th className="px-4 py-3">Destination NGO</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((item) => {
                const request = item.donation_request;
                const donation = request?.donation;
                const ngo = request?.ngo;

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-semibold text-foreground">{donation?.food_name || 'Surplus Food'}</td>
                    <td className="px-4 py-4 text-muted-foreground">{ngo?.organization_name || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          item.delivery_status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : item.delivery_status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {item.delivery_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground text-xs">
                      {item.completion_time ? new Date(item.completion_time).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
