import React, { useState } from 'react';
import {
  useNearbyDonationsQuery,
  useNgoProfileQuery,
  useSubmitRequestMutation,
} from '../../hooks/useNgo.js';
import DistanceBadge from '../../components/ngo/DistanceBadge.jsx';
import DonationMap from '../../components/ngo/DonationMap.jsx';
import RequestForm from '../../components/ngo/RequestForm.jsx';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map,
  ShoppingBag,
  Clock,
  Compass,
  AlertCircle,
  X,
} from 'lucide-react';

export const DiscoverDonations = () => {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'table' | 'map'
  const [radius, setRadius] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Queries & Mutations
  const { data: profileQuery } = useNgoProfileQuery();
  const ngo = profileQuery?.data;

  const filters = {
    search,
    category,
    type,
    radius,
    sort: 'distance',
  };

  const { data: donationsQuery, isLoading } = useNearbyDonationsQuery(filters);
  const submitRequest = useSubmitRequestMutation();

  const donations = donationsQuery?.data?.records || [];
  const totalRecords = donationsQuery?.data?.metadata?.total || 0;

  const handleClaimSubmit = (data) => {
    submitRequest.mutate(
      {
        donation_id: selectedDonation.id,
        ...data,
      },
      {
        onSuccess: () => {
          setSelectedDonation(null);
          setShowRequestForm(false);
        },
      }
    );
  };

  if (ngo?.status !== 'VERIFIED') {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4 bg-card border border-border rounded-2xl shadow-sm mt-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Only VERIFIED organization profiles are authorized to discover and claim nearby food surplus.
          Please complete your profile details and upload verification credentials for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Search & Tabs control */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Discover Surplus Food Listings</h1>
          <p className="text-sm text-muted-foreground">Browse active food donations within your operating radius.</p>
        </div>

        {/* View Tabs Selector */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('grid')}
            className={`p-2 rounded-md transition-all ${
              activeTab === 'grid' ? 'bg-background text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`p-2 rounded-md transition-all ${
              activeTab === 'table' ? 'bg-background text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`p-2 rounded-md transition-all ${
              activeTab === 'map' ? 'bg-background text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Map Discovery"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter sliders */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Radius KM Slider */}
        <div className="space-y-1 md:col-span-1">
          <div className="flex justify-between text-xs text-foreground font-semibold">
            <span>Radius Limit</span>
            <span>{radius} KM</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-primary bg-secondary rounded-lg h-2"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-foreground text-sm"
        >
          <option value="">All Categories</option>
          <option value="Cooked Food">Cooked Food</option>
          <option value="Raw Food">Raw Food</option>
          <option value="Packed Food">Packed Food</option>
          <option value="Bakery">Bakery</option>
          <option value="Fruits">Fruits</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Dairy">Dairy</option>
          <option value="Beverages">Beverages</option>
          <option value="Snacks">Snacks</option>
        </select>

        {/* Food type selection */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-foreground text-sm"
        >
          <option value="">All Types</option>
          <option value="VEG">VEG</option>
          <option value="NON_VEG">NON_VEG</option>
          <option value="VEGAN">VEGAN</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>

      {/* Discovery Contents */}
      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse text-sm">Scanning nearby coordinates...</div>
      ) : donations.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground text-sm">
          No available food listings found within {radius} KM coordinates.
        </div>
      ) : activeTab === 'map' ? (
        <DonationMap
          ngoLatitude={ngo.latitude}
          ngoLongitude={ngo.longitude}
          donations={donations}
          onSelectDonation={(item) => {
            setSelectedDonation(item);
            setShowRequestForm(true);
          }}
        />
      ) : activeTab === 'table' ? (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-muted/30 border-b border-border text-foreground font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Food Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Expiry</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donations.map((item) => (
                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-bold text-foreground">{item.food_name}</td>
                  <td className="p-4">{item.food_category}</td>
                  <td className="p-4 font-semibold">{item.quantity} {item.quantity_unit}</td>
                  <td className="p-4">
                    <DistanceBadge distance={item.distance} />
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{new Date(item.expiry_time).toLocaleTimeString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedDonation(item);
                        setShowRequestForm(true);
                      }}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow"
                    >
                      Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              
              {/* Image banner details */}
              <div className="relative h-44 bg-muted">
                {item.donation_images?.length > 0 ? (
                  <img
                    src={item.donation_images[0].image_url}
                    alt={item.food_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <DistanceBadge distance={item.distance} />
                </div>
              </div>

              <div className="p-5 flex-1 space-y-3">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    {item.food_category}
                  </span>
                  <h3 className="font-extrabold text-base text-foreground leading-snug mt-0.5">
                    {item.food_name}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description || 'No description provided.'}
                </p>

                <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-3">
                  <span>Qty: <strong>{item.quantity} {item.quantity_unit}</strong></span>
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Expiry: {new Date(item.expiry_time).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/10 border-t border-border flex justify-end">
                <button
                  onClick={() => {
                    setSelectedDonation(item);
                    setShowRequestForm(true);
                  }}
                  className="w-full inline-flex items-center justify-center py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all shadow"
                >
                  Claim Surplus Food
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Request details claim modal form */}
      {showRequestForm && selectedDonation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => {
                setSelectedDonation(null);
                setShowRequestForm(false);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <RequestForm
              donation={selectedDonation}
              onSubmit={handleClaimSubmit}
              onCancel={() => {
                setSelectedDonation(null);
                setShowRequestForm(false);
              }}
              isSubmitting={submitRequest.isPending}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default DiscoverDonations;
