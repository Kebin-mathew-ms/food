import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

/**
 * Filter control bar for listing, searching, and sorting donation listings.
 */
export const DonationFilters = ({ filters, onFilterChange, onReset }) => {
  const categories = [
    'Cooked Food',
    'Raw Food',
    'Packed Food',
    'Bakery',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Beverages',
    'Snacks',
    'Desserts',
    'Other',
  ];

  const types = [
    { value: 'VEG', label: 'Vegetarian' },
    { value: 'NON_VEG', label: 'Non-Vegetarian' },
    { value: 'VEGAN', label: 'Vegan' },
    { value: 'OTHER', label: 'Other' },
  ];

  const statuses = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'REQUESTED', label: 'Requested' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            placeholder="Search by food name, details, address..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        {/* Clear Filters Triggers */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-input rounded-lg bg-background hover:bg-accent text-muted-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/40">
        
        {/* Category Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
          <select
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none text-sm"
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Food Type Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Food Type</label>
          <select
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none text-sm"
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="">All Food Types</option>
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
          <select
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none text-sm"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting option */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Sort By</label>
          <select
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none text-sm"
            value={filters.sort || 'created_at'}
            onChange={(e) => handleChange('sort', e.target.value)}
          >
            <option value="created_at">Newest First</option>
            <option value="expiry">Expiry Time</option>
            <option value="quantity">Quantity</option>
            <option value="status">Status</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default DonationFilters;
