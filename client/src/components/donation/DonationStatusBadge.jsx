import React from 'react';

/**
 * Renders status badges themed according to the donation lifecycle state.
 */
export const DonationStatusBadge = ({ status }) => {
  const statusStyles = {
    AVAILABLE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    REQUESTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    APPROVED: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    PICKED_UP: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    DELIVERED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    EXPIRED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    CANCELLED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  const labelMap = {
    AVAILABLE: 'Available',
    REQUESTED: 'Requested',
    APPROVED: 'Approved',
    PICKED_UP: 'Picked Up',
    DELIVERED: 'Delivered',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        statusStyles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      }`}
    >
      {labelMap[status] || status}
    </span>
  );
};

export default DonationStatusBadge;
