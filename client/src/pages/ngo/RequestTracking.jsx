import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useRequestDetailsQuery,
  useCancelRequestMutation,
  useSubmitFeedbackMutation,
} from '../../hooks/useNgo.js';
import RequestTimeline from '../../components/ngo/RequestTimeline.jsx';
import FeedbackForm from '../../components/ngo/FeedbackForm.jsx';
import {
  Phone,
  MapPin,
  Clock,
  ArrowLeft,
  ShieldCheck,
  User,
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react';

export const RequestTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: requestQuery, isLoading } = useRequestDetailsQuery(id);
  const cancelMutation = useCancelRequestMutation();
  const feedbackMutation = useSubmitFeedbackMutation(id);

  const requestRecord = requestQuery?.data;

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this food redistribution request?')) {
      cancelMutation.mutate(id, {
        onSuccess: () => {
          navigate('/ngo/dashboard');
        },
      });
    }
  };

  const handleFeedbackSubmit = (data) => {
    feedbackMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Retrieving request claim tracking details...</div>
      </div>
    );
  }

  if (!requestRecord) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        Redistribution request not found.
      </div>
    );
  }

  const { donation, volunteer, request_status, remarks } = requestRecord;
  const donor = donation?.donor;

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ngo/dashboard')}
          className="p-2 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Claim Tracking Details</h1>
          <p className="text-xs text-muted-foreground mt-0.5">ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Claim and donor information summary */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                {donation?.food_category}
              </span>
              <h2 className="text-lg font-extrabold text-foreground mt-0.5">{donation?.food_name}</h2>
              <span className="text-xs text-muted-foreground mt-0.5 block">
                Quantity: <strong>{donation?.quantity} {donation?.quantity_unit}</strong>
              </span>
            </div>

            <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Donor info */}
              <div className="space-y-2 text-sm text-foreground">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">Donor / Partner</span>
                <span className="font-bold block">{donor?.full_name || 'Individual Donor'}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" /> {donation?.pickup_address || 'N/A'}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" /> {donation?.pickup_contact_phone || 'N/A'}
                </span>
              </div>

              {/* Volunteer details */}
              <div className="space-y-2 text-sm text-foreground">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">Assigned Volunteer</span>
                {volunteer ? (
                  <>
                    <span className="font-bold block">{volunteer.full_name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-4 h-4 text-primary" /> {volunteer.phone || 'N/A'}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground block italic">Waiting for volunteer assignment...</span>
                )}
              </div>

            </div>

            {/* Remarks */}
            {remarks && (
              <div className="border-t border-border pt-4 text-sm text-foreground space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">Your Intended Remarks</span>
                <p className="text-xs leading-relaxed opacity-95">{remarks}</p>
              </div>
            )}

            {/* Cancel request button if pending */}
            {request_status === 'PENDING' && (
              <div className="border-t border-border pt-4 flex justify-end">
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="inline-flex items-center justify-center px-4 py-2 border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 text-xs font-semibold rounded-lg transition-colors gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Cancel Request Claim
                </button>
              </div>
            )}

          </div>

          {/* Feedback Form trigger once status is DELIVERED */}
          {request_status === 'DELIVERED' && (
            <div className="space-y-6">
              {requestRecord.rating ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-sm">Feedback Already Submitted</span>
                    <p className="text-xs mt-0.5">Thank you! Your ratings are recorded to help optimize volunteers coordination.</p>
                  </div>
                </div>
              ) : (
                <FeedbackForm
                  onSubmit={handleFeedbackSubmit}
                  isSubmitting={feedbackMutation.isPending}
                />
              )}
            </div>
          )}

        </div>

        {/* Right column timeline */}
        <div>
          <RequestTimeline status={request_status} />
        </div>

      </div>

    </div>
  );
};

export default RequestTracking;
