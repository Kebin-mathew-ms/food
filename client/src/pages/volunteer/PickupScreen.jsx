import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useDeliveryDetailsQuery,
  useStartTransitMutation,
  useArrivedMutation,
  usePickupMutation,
  useUploadPickupImageMutation,
  useVolunteerProfileQuery,
} from '../../hooks/useVolunteer.js';
import DonationDeliveryMap from '../../components/volunteer/DonationDeliveryMap.jsx';
import LocationTracker from '../../components/volunteer/LocationTracker.jsx';
import DeliveryTimeline from '../../components/volunteer/DeliveryTimeline.jsx';
import CountdownTimer from '../../components/donation/CountdownTimer.jsx';
import { Phone, MapPin, Upload, Navigation, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PickupScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profile } = useVolunteerProfileQuery();
  const { data: delivery, isLoading } = useDeliveryDetailsQuery(id);

  const startTransit = useStartTransitMutation();
  const arrived = useArrivedMutation();
  const pickup = usePickupMutation();
  const uploadImage = useUploadPickupImageMutation();

  const [photoUrl, setPhotoUrl] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading pickup details...</div>
      </div>
    );
  }

  const item = delivery?.data;
  if (!item) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground">Delivery task not found.</div>
      </div>
    );
  }

  const donation = item.donation_request?.donation;
  const ngo = item.donation_request?.ngo;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    uploadImage.mutate(
      { deliveryId: id, formData },
      {
        onSuccess: (data) => {
          setPhotoUrl(data.data.photoUrl);
          toast.success('Pickup proof photo uploaded successfully.');
        },
        onError: () => {
          toast.error('Failed to upload proof photo.');
        },
      }
    );
  };

  const handleConfirmPickup = () => {
    if (!photoUrl) {
      toast.error('Please upload a pickup proof photo first.');
      return;
    }

    const payload = {
      latitude: coords.lat || 47.6062,
      longitude: coords.lng || -122.3321,
      photoUrl,
    };

    pickup.mutate(
      { deliveryId: id, payload },
      {
        onSuccess: () => {
          navigate(`/volunteer/delivery/${id}`);
        },
      }
    );
  };

  const currentStatus = item.delivery_status;

  const volunteerCoords = {
    lat: profile?.data?.current_latitude || coords.lat,
    lng: profile?.data?.current_longitude || coords.lng,
  };

  const donorCoords = {
    lat: donation?.pickup_latitude,
    lng: donation?.pickup_longitude,
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 text-foreground">
      {/* Background Geolocation telemetry tracker */}
      <LocationTracker activeDeliveryId={id} />

      {/* Title Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border border-border p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">📦 Food Pickup Task Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">Navigate to donor point, verify contents, and snap proof image.</p>
        </div>

        {donation?.expiry_time && (
          <div className="flex items-center gap-3 bg-muted/40 px-4 py-2 rounded-xl border border-border">
            <span className="text-xs text-muted-foreground font-semibold">Expires:</span>
            <CountdownTimer expiryTime={donation.expiry_time} />
          </div>
        )}
      </div>

      {/* Stepper progress timeline tracker */}
      <DeliveryTimeline currentStatus={currentStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: instructions + details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Map navigation */}
          <DonationDeliveryMap
            volCoords={volunteerCoords}
            donorCoords={donorCoords}
            ngoCoords={null}
            distance={item.distance}
            eta="12 Mins"
          />

          {/* Donor Information specifications */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 text-foreground">Donor Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Donor Representative</span>
                <span className="font-semibold text-foreground">{donation?.donor?.full_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Representative Contact</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {donation?.donor?.phone || 'N/A'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground block font-semibold">Pickup Address Location</span>
                <span className="font-semibold text-foreground flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> {donation?.pickup_address}
                </span>
              </div>
              {donation?.special_instructions && (
                <div className="sm:col-span-2 bg-muted/30 p-3 rounded-lg border border-border text-xs text-muted-foreground">
                  <strong>Special Instructions:</strong> {donation.special_instructions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: control workflows + photo uploader */}
        <div className="flex flex-col gap-6">
          {/* Action triggers */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 text-foreground">Workflow Controls</h3>

            {currentStatus === 'ACCEPTED' && (
              <button
                type="button"
                onClick={() => startTransit.mutate(id)}
                disabled={startTransit.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary border border-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-sm"
              >
                <Navigation className="w-4 h-4" /> Start Transit to Donor
              </button>
            )}

            {currentStatus === 'ON_THE_WAY_TO_PICKUP' && (
              <button
                type="button"
                onClick={() => arrived.mutate(id)}
                disabled={arrived.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary border border-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-sm"
              >
                <CheckCircle className="w-4 h-4" /> Arrived At Pickup Point
              </button>
            )}

            {(currentStatus === 'ARRIVED_AT_PICKUP' || currentStatus === 'PICKED_UP') && (
              <div className="flex flex-col gap-4">
                {/* Image upload panel */}
                <div className="w-full border-2 border-dashed border-border hover:border-muted-foreground/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer relative bg-muted/20">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept="image/jpeg,image/png,image/jpg"
                  />
                  {photoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={photoUrl} className="w-20 h-20 object-cover rounded-lg border border-border" alt="Proof" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Proof image captured</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs font-semibold text-foreground">Click to Snap or upload photo proof</span>
                      <span className="text-[10px] text-muted-foreground mt-1 font-medium">JPEG/PNG, Max 5MB</span>
                    </>
                  )}
                </div>

                {currentStatus === 'ARRIVED_AT_PICKUP' && (
                  <button
                    type="button"
                    onClick={handleConfirmPickup}
                    disabled={pickup.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 border border-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-sm"
                  >
                    Confirm Pickup Completed
                  </button>
                )}

                {currentStatus === 'PICKED_UP' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/volunteer/delivery/${id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary border border-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Proceed to Destination <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
