import React, { useState } from 'react';
import { useDonationsQuery, useCancelDonationMutation } from '../../hooks/useDonations.js';
import DonationFilters from '../../components/donation/DonationFilters.jsx';
import DonationTable from '../../components/donation/DonationTable.jsx';
import DonationCard from '../../components/donation/DonationCard.jsx';
import LoadingSkeleton from '../../components/donation/LoadingSkeleton.jsx';
import EmptyState from '../../components/donation/EmptyState.jsx';
import { LayoutGrid, List, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Historical listing screen of all user donations, with search, filters, pagination, and toggle views.
 */
export const DonationHistory = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    status: '',
    sort: 'created_at',
    order: 'desc',
    page: 1,
    limit: 6,
    selfOnly: 'true', // Restricts history to current user only
  });

  const { data: response, isLoading, refetch } = useDonationsQuery(filters);
  const cancelMutation = useCancelDonationMutation();

  const donations = response?.data?.records || [];
  const metadata = response?.data?.metadata || { page: 1, last_page: 1, total: 0 };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCancelDonation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this donation listing?')) {
      try {
        await cancelMutation.mutateAsync(id);
        refetch();
      } catch (err) {
        // Errors handled by React Query
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      status: '',
      sort: 'created_at',
      order: 'desc',
      page: 1,
      limit: 6,
      selfOnly: 'true',
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Donation History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage, filter, and track all your previous surplus food donations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle controls */}
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/donations/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> New Donation
          </Link>
        </div>
      </div>

      {/* Query Filter panel */}
      <DonationFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      {/* Main Listing View */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No food listings found"
          description="Adjust your search criteria or register a new surplus donation."
          action={
            <Link
              to="/donations/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> List Food Now
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <DonationCard
              key={d.id}
              donation={d}
              onCancel={handleCancelDonation}
              onExpire={refetch}
            />
          ))}
        </div>
      ) : (
        <DonationTable donations={donations} onCancel={handleCancelDonation} />
      )}

      {/* Pagination control footer bar */}
      {donations.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground bg-muted/5 p-4 rounded-lg">
          <span>
            Showing Page <span className="font-bold text-foreground">{metadata.page}</span> of{' '}
            <span className="font-bold text-foreground">{metadata.last_page}</span> ({metadata.total} total records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(metadata.page - 1)}
              disabled={metadata.page === 1}
              className="p-1.5 rounded border border-border bg-card hover:bg-accent text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(metadata.page + 1)}
              disabled={metadata.page === metadata.last_page}
              className="p-1.5 rounded border border-border bg-card hover:bg-accent text-foreground disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DonationHistory;
