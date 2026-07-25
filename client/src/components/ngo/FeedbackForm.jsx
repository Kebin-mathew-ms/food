import React, { useState } from 'react';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export const FeedbackForm = ({ onSubmit, isSubmitting = false }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [packagingQuality, setPackagingQuality] = useState('GOOD');
  const [deliveryTimeliness, setDeliveryTimeliness] = useState('ON_TIME');
  const [volunteerCoordination, setVolunteerCoordination] = useState('EXCELLENT');
  const [comments, setComments] = useState('');

  const handleSubmitSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5 stars.');
      return;
    }

    onSubmit({
      rating,
      packaging_quality: packagingQuality,
      delivery_timeliness: deliveryTimeliness,
      volunteer_coordination: volunteerCoordination,
      comments,
    });
  };

  return (
    <form onSubmit={handleSubmitSubmit} className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
          <MessageSquare className="w-5 h-5 text-primary" /> Delivery Feedback Survey
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Help us improve the food redistribution pipeline by sharing your coordination experience.
        </p>
      </div>

      {/* Star ratings */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground block">Overall Experience Rating *</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-7 h-7 ${
                    active ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Packaging Quality */}
        <div>
          <label className="text-sm font-semibold text-foreground">Packaging Quality</label>
          <select
            value={packagingQuality}
            onChange={(e) => setPackagingQuality(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
          >
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="AVERAGE">Average</option>
            <option value="POOR">Poor</option>
          </select>
        </div>

        {/* Timeliness */}
        <div>
          <label className="text-sm font-semibold text-foreground">Delivery Timeliness</label>
          <select
            value={deliveryTimeliness}
            onChange={(e) => setDeliveryTimeliness(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
          >
            <option value="EARLY">Early</option>
            <option value="ON_TIME">On Time</option>
            <option value="DELAYED">Delayed</option>
            <option value="SEVERELY_DELAYED">Severely Delayed</option>
          </select>
        </div>

        {/* Volunteer Coordination */}
        <div>
          <label className="text-sm font-semibold text-foreground">Volunteer Coordination</label>
          <select
            value={volunteerCoordination}
            onChange={(e) => setVolunteerCoordination(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground sm:text-sm"
          >
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="AVERAGE">Average</option>
            <option value="POOR">Poor</option>
          </select>
        </div>
      </div>

      {/* Remarks/Comments */}
      <div>
        <label className="text-sm font-semibold text-foreground block">Additional Comments</label>
        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Share details on volunteer friendliness, hygiene, or packaging condition..."
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary sm:text-sm"
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting
            </span>
          ) : (
            'Submit Feedback'
          )}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
