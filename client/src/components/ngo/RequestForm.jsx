import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Calendar } from 'lucide-react';

const requestFormSchema = z.object({
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters.').optional(),
  expected_pickup_time: z.string().min(1, 'Expected pickup time is required.'),
  estimated_arrival_time: z.string().min(1, 'Estimated arrival time is required.'),
  special_requirements: z.string().optional(),
}).refine(
  (data) => new Date(data.estimated_arrival_time) > new Date(data.expected_pickup_time),
  {
    message: 'Estimated arrival time must be after the expected pickup time.',
    path: ['estimated_arrival_time'],
  }
);

export const RequestForm = ({ donation, onSubmit, onCancel, isSubmitting = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      remarks: '',
      expected_pickup_time: '',
      estimated_arrival_time: '',
      special_requirements: '',
    },
  });

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-md space-y-6">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Claim Food Donation Request
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Specify your collection timeline details below.
        </p>
      </div>

      <div className="p-4 bg-muted/50 border border-border rounded-lg text-sm text-foreground">
        <span className="font-bold text-xs text-primary uppercase block tracking-wider">Selected Listing</span>
        <span className="font-bold text-base block mt-0.5">{donation?.food_name}</span>
        <span className="text-xs text-muted-foreground block mt-0.5">
          Category: {donation?.food_category} | Qty: {donation?.quantity} {donation?.quantity_unit}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Expected Pickup Time */}
        <div>
          <label className="text-sm font-semibold text-foreground">Expected Pickup Time *</label>
          <input
            type="datetime-local"
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary sm:text-sm"
            {...register('expected_pickup_time')}
          />
          {errors.expected_pickup_time && (
            <p className="mt-1 text-xs text-destructive">{errors.expected_pickup_time.message}</p>
          )}
        </div>

        {/* Estimated Arrival Time */}
        <div>
          <label className="text-sm font-semibold text-foreground">Estimated Arrival / Delivery Time *</label>
          <input
            type="datetime-local"
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary sm:text-sm"
            {...register('estimated_arrival_time')}
          />
          {errors.estimated_arrival_time && (
            <p className="mt-1 text-xs text-destructive">{errors.estimated_arrival_time.message}</p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="text-sm font-semibold text-foreground">Remarks / Intended Use</label>
          <textarea
            rows={2}
            disabled={isSubmitting}
            placeholder="e.g. For evening distribution shelter..."
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary sm:text-sm"
            {...register('remarks')}
          />
          {errors.remarks && (
            <p className="mt-1 text-xs text-destructive">{errors.remarks.message}</p>
          )}
        </div>

        {/* Special Requirements */}
        <div>
          <label className="text-sm font-semibold text-foreground">Special Requirements</label>
          <textarea
            rows={2}
            disabled={isSubmitting}
            placeholder="e.g. Temperature control vehicle needed..."
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary sm:text-sm"
            {...register('special_requirements')}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-border text-foreground hover:bg-muted text-sm font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-6 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting Claim
              </span>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
