import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useDonationQuery,
  useUploadImageMutation,
  useDeleteImageMutation,
  useReorderImagesMutation,
  useCancelDonationMutation,
} from '../../hooks/useDonations.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DonationStatusBadge from '../../components/donation/DonationStatusBadge.jsx';
import CountdownTimer from '../../components/donation/CountdownTimer.jsx';
import DonationTimeline from '../../components/donation/DonationTimeline.jsx';
import LocationPickerMap from '../../components/donation/LocationPickerMap.jsx';
import ImageUploader from '../../components/donation/ImageUploader.jsx';
import { ArrowLeft, Edit2, Calendar, MapPin, Users, Heart, Ban, Loader2 } from 'lucide-react';

/**
 * Detailed view of a single food donation.
 */
export const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: response, isLoading, refetch } = useDonationQuery(id);
  const cancelMutation = useCancelDonationMutation();
  const uploadImageMutation = useUploadImageMutation(id);
  const deleteImageMutation = useDeleteImageMutation(id);
  const reorderImagesMutation = useReorderImagesMutation(id);

  const donation = response?.data;
  const isOwner = user?.id === donation?.donor_id;

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this donation listing?')) {
      try {
        await cancelMutation.mutateAsync(id);
        refetch();
      } catch (err) {
        // Errors handled by React Query
      }
    }
  };

  const handleUploadImage = async (file) => {
    try {
      await uploadImageMutation.mutateAsync(file);
      refetch();
    } catch (err) {
      // Errors handled by React Query
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImageMutation.mutateAsync(imageId);
      refetch();
    } catch (err) {
      // Errors handled by React Query
    }
  };

  const handleReorderImages = async (orderedIds) => {
    try {
      await reorderImagesMutation.mutateAsync(orderedIds);
      refetch();
    } catch (err) {
      // Errors handled by React Query
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-bold text-foreground">Donation Listing Not Found</h3>
        <Link to="/dashboard" className="text-sm text-primary hover:underline mt-2 inline-block">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/donations/history"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>
        </div>

        {isOwner && donation.status === 'AVAILABLE' && (
          <div className="flex gap-2">
            <Link
              to={`/donations/${donation.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-input bg-card text-foreground hover:bg-accent transition-all"
            >
              <Edit2 className="w-4 h-4" /> Edit Listing
            </Link>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"
            >
              <Ban className="w-4 h-4" /> Cancel Listing
            </button>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Details & Map) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            
            {/* Title Panel */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-primary">
                  {donation.food_category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5">
                  {donation.food_name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Listed on {new Date(donation.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <DonationStatusBadge status={donation.status} />
                {donation.status === 'AVAILABLE' && (
                  <CountdownTimer expiryTime={donation.expiry_time} onExpire={refetch} />
                )}
              </div>
            </div>

            {/* Specs row */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border border-border/40 text-center">
              <div>
                <Heart className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-muted-foreground block">Quantity</span>
                <span className="text-sm font-bold text-foreground">
                  {donation.quantity} {donation.quantity_unit}
                </span>
              </div>
              <div>
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-muted-foreground block">Estimated Servings</span>
                <span className="text-sm font-bold text-foreground">
                  {donation.number_of_people || 'N/A'} people
                </span>
              </div>
              <div>
                <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-muted-foreground block">Food Type</span>
                <span className="text-sm font-bold text-foreground uppercase">
                  {donation.food_type}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {donation.description}
              </p>
            </div>

            {/* Dates / Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">Prepared Date/Time:</span>
                <p className="text-foreground mt-0.5">{new Date(donation.prepared_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Expiry Date/Time:</span>
                <p className="text-foreground mt-0.5">{new Date(donation.expiry_time).toLocaleString()}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-muted-foreground">Expected Pickup Time:</span>
                <p className="text-foreground mt-0.5">
                  {donation.pickup_time ? new Date(donation.pickup_time).toLocaleString() : 'Not Specified'}
                </p>
              </div>
            </div>

          </div>

          {/* Leaflet map display */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> Pickup Location Coordinates
            </h3>
            <p className="text-sm text-muted-foreground">
              {donation.pickup_address}, {donation.pickup_city}, {donation.pickup_state}, {donation.pickup_country}
            </p>
            
            <LocationPickerMap
              latitude={donation.pickup_latitude}
              longitude={donation.pickup_longitude}
              readOnly={true}
            />
          </div>

        </div>

        {/* Right Columns (Timeline & Image Management) */}
        <div className="space-y-6">
          {/* Status timeline tracker */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
              Donation Progress Tracker
            </h3>
            <DonationTimeline status={donation.status} createdAt={donation.created_at} />
          </div>

          {/* Photo gallery management */}
          {isOwner && (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <ImageUploader
                images={donation.donation_images}
                onUpload={handleUploadImage}
                onDelete={handleDeleteImage}
                onReorder={handleReorderImages}
                isUploading={uploadImageMutation.isPending}
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default DonationDetails;
