import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useDeliveryDetailsQuery,
  useStartTransitMutation,
  useArrivedMutation,
  useCompleteDeliveryMutation,
  useUploadDeliveryImageMutation,
  useUploadSignatureMutation,
  useVolunteerProfileQuery,
} from '../../hooks/useVolunteer.js';
import DonationDeliveryMap from '../../components/volunteer/DonationDeliveryMap.jsx';
import LocationTracker from '../../components/volunteer/LocationTracker.jsx';
import DeliveryTimeline from '../../components/volunteer/DeliveryTimeline.jsx';
import SignaturePad from '../../components/volunteer/SignaturePad.jsx';
import { Phone, MapPin, Upload, Navigation, CheckCircle, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeliveryScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profile } = useVolunteerProfileQuery();
  const { data: delivery, isLoading } = useDeliveryDetailsQuery(id);

  const startTransit = useStartTransitMutation();
  const arrived = useArrivedMutation();
  const complete = useCompleteDeliveryMutation();
  const uploadImage = useUploadDeliveryImageMutation();
  const uploadSignature = useUploadSignatureMutation();

  const [photoUrl, setPhotoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [notes, setNotes] = useState('');
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
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading delivery details...</div>
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
          toast.success('Delivery proof photo uploaded.');
        },
        onError: () => {
          toast.error('Failed to upload proof photo.');
        },
      }
    );
  };

  const handleSaveSignature = (base64Sig) => {
    uploadSignature.mutate(
      { deliveryId: id, signature: base64Sig },
      {
        onSuccess: (data) => {
          setSignatureUrl(data.data.signatureUrl);
          toast.success('Signature saved successfully.');
        },
        onError: () => {
          toast.error('Failed to upload signature image.');
        },
      }
    );
  };

  const handleCompleteDelivery = () => {
    if (!photoUrl) {
      toast.error('Please upload a delivery proof photo.');
      return;
    }
    if (!signatureUrl) {
      toast.error('Please capture recipient signature first.');
      return;
    }

    const payload = {
      latitude: coords.lat || 47.6062,
      longitude: coords.lng || -122.3321,
      photoUrl,
      signatureUrl,
      delivery_notes: notes,
    };

    complete.mutate(
      { deliveryId: id, payload },
      {
        onSuccess: () => {
          navigate('/volunteer/dashboard');
        },
      }
    );
  };

  const currentStatus = item.delivery_status;

  const volunteerCoords = {
    lat: profile?.data?.current_latitude || coords.lat,
    lng: profile?.data?.current_longitude || coords.lng,
  };

  const ngoCoords = {
    lat: ngo?.latitude,
    lng: ngo?.longitude,
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 text-foreground">
      {/* Telemetry background logs */}
      <LocationTracker activeDeliveryId={id} />

      {/* Header title */}
      <div className="flex flex-col justify-start bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">🤝 Food Delivery Task Details</h1>
        <p className="text-sm text-muted-foreground mt-0.5 font-medium">Navigate to NGO shelter kitchen point, complete transit steps, and sign off.</p>
      </div>

      {/* Stepper timeline */}
      <DeliveryTimeline currentStatus={currentStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: navigation + details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Map display */}
          <DonationDeliveryMap
            volCoords={volunteerCoords}
            donorCoords={null}
            ngoCoords={ngoCoords}
            distance={item.distance}
            eta="8 Mins"
          />

          {/* Destination NGO particulars */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 text-foreground">NGO Recipient Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Organization Name</span>
                <span className="font-semibold text-foreground">{ngo?.organization_name}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Contact Phone</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {ngo?.phone || 'N/A'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground block font-semibold">Destination Address</span>
                <span className="font-semibold text-foreground flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {ngo?.address}, {ngo?.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: uploads proofs + signatures */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 text-foreground">Workflow Controls</h3>

            {currentStatus === 'PICKED_UP' && (
              <button
                type="button"
                onClick={() => startTransit.mutate(id)}
                disabled={startTransit.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary border border-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-sm"
              >
                <Navigation className="w-4 h-4" /> Start Transit to NGO
              </button>
            )}

            {currentStatus === 'IN_TRANSIT' && (
              <button
                type="button"
                onClick={() => arrived.mutate(id)}
                disabled={arrived.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary border border-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-sm"
              >
                <CheckCircle className="w-4 h-4" /> Arrived At Destination NGO
              </button>
            )}

            {(currentStatus === 'ARRIVED_AT_DESTINATION' || currentStatus === 'DELIVERED') && (
              <div className="flex flex-col gap-4">
                {/* File photo proof upload */}
                <div className="w-full border-2 border-dashed border-border hover:border-muted-foreground/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer relative bg-muted/20">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept="image/jpeg,image/png,image/jpg"
                  />
                  {photoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={photoUrl} className="w-16 h-16 object-cover rounded-lg border border-border" alt="Proof" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Delivery photo captured</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs font-semibold text-foreground">Upload delivery photo proof</span>
                    </>
                  )}
                </div>

                {/* Recipient signature pad */}
                {signatureUrl ? (
                  <div className="flex flex-col items-center gap-2 bg-muted/30 p-4 border border-border rounded-xl">
                    <img src={signatureUrl} className="w-28 h-12 object-contain bg-background border border-border rounded" alt="Signature" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Signature registered</span>
                  </div>
                ) : (
                  <SignaturePad onSave={handleSaveSignature} />
                )}

                {/* Delivery notes field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">Delivery notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide any delivery feedback details here..."
                    className="bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCompleteDelivery}
                  disabled={complete.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 border border-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-sm"
                >
                  Complete Delivery Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
