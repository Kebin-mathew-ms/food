import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDonationQuery, useUpdateDonationMutation } from '../../hooks/useDonations.js';
import DonationForm from '../../components/donation/DonationForm.jsx';
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Page to edit a food donation listing.
 */
export const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading } = useDonationQuery(id);
  const updateMutation = useUpdateDonationMutation();

  const donation = response?.data;

  const handleFormSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({ id, updateData: data });
      navigate(`/donations/${id}`);
    } catch (err) {
      // Error notifications handled by React Query mutation
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
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <Link
          to={`/donations/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel and Back
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Edit Donation Listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update schedules, packaging quantities, or pickup details.
        </p>
      </div>

      <DonationForm
        initialValues={donation}
        onSubmit={handleFormSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
};

export default EditDonation;
