import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, Download, Table } from 'lucide-react';
import DonationStatusBadge from './DonationStatusBadge.jsx';

/**
 * Tabular listing representation of donation history, supporting CSV/Excel exports.
 */
export const DonationTable = ({ donations = [], onCancel }) => {
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Food Name',
      'Category',
      'Food Type',
      'Quantity',
      'Unit',
      'Servings',
      'Prepared At',
      'Expiry Time',
      'Status',
      'Pickup Address',
      'City',
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = donations.map((d) => [
      d.id,
      d.food_name,
      d.food_category,
      d.food_type,
      d.quantity,
      d.quantity_unit,
      d.number_of_people || 0,
      d.prepared_at,
      d.expiry_time,
      d.status,
      d.pickup_address,
      d.pickup_city || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Donation_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Table className="w-5 h-5 text-primary" /> Listing History Table
        </h2>
        
        {donations.length > 0 && (
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV / Excel
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-muted/10 font-semibold">
              <th className="p-4">Food Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Prepared Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {donations.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-muted-foreground">
                  No records to display.
                </td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d.id} className="hover:bg-accent/20 transition-colors">
                  <td className="p-4 font-bold text-foreground">{d.food_name}</td>
                  <td className="p-4 text-muted-foreground">{d.food_category}</td>
                  <td className="p-4 text-muted-foreground">
                    {d.quantity} {d.quantity_unit}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(d.prepared_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <DonationStatusBadge status={d.status} />
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      to={`/donations/${d.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-input bg-background text-foreground hover:bg-accent text-xs font-semibold"
                    >
                      <Eye className="w-3 h-3" /> View
                    </Link>

                    {d.status === 'AVAILABLE' && (
                      <>
                        <Link
                          to={`/donations/${d.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-input bg-background text-foreground hover:text-primary hover:bg-accent text-xs font-semibold"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </Link>
                        <button
                          onClick={() => onCancel(d.id)}
                          className="inline-flex items-center px-2.5 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-white text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationTable;
