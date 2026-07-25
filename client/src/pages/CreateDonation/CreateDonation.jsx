import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDonationMutation } from '../../hooks/useDonations.js';
import DonationForm from '../../components/donation/DonationForm.jsx';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Page to list a new food donation.
 */
export const CreateDonation = () => {
  const navigate = useNavigate();
  const createMutation = useCreateDonationMutation();

  const handleFormSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/dashboard');
    } catch (err) {
      // Error notifications handled by React Query mutation
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Back navigation link */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">List Food Donation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter details about surplus food availability, preparation date, and pickup location coordinates.
        </p>
      </div>

      <DonationForm
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
};

export default CreateDonation;
