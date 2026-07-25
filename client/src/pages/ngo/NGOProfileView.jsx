import React from 'react';
import {
  useNgoProfileQuery,
  useUpdateNgoProfileMutation,
  useUploadNgoDocumentsMutation,
} from '../../hooks/useNgo.js';
import NGOProfileForm from '../../components/ngo/NGOProfileForm.jsx';
import DocumentUploader from '../../components/ngo/DocumentUploader.jsx';
import { ShieldCheck, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';

export const NGOProfileView = () => {
  const { data: profileQuery, isLoading } = useNgoProfileQuery();
  const updateProfile = useUpdateNgoProfileMutation();
  const uploadDocuments = useUploadNgoDocumentsMutation();

  const ngo = profileQuery?.data;

  const getStatusBanner = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending Initial Verification Details',
          desc: 'Complete your organization coordinates and submit registration credentials to initiate the review cycle.',
          icon: Clock,
          colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Documents Under Verification Review',
          desc: 'Our administrative compliance team is analyzing your uploaded credentials. You will receive updates shortly.',
          icon: AlertTriangle,
          colorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
        };
      case 'VERIFIED':
        return {
          label: 'Verified Organization Status',
          desc: 'Congratulations! Your organization is fully verified. You have full access to discover nearby food listings.',
          icon: ShieldCheck,
          colorClass: 'bg-green-500/10 border-green-500/20 text-green-500',
        };
      case 'REJECTED':
        return {
          label: 'Verification Rejected',
          desc: 'The documents submitted failed compliance standards. Please re-upload valid government ID and certificate.',
          icon: ShieldAlert,
          colorClass: 'bg-destructive/10 border-destructive/20 text-destructive',
        };
      default:
        return {
          label: 'Complete Profile Details',
          desc: 'Establish your credentials to begin redistributing food.',
          icon: Clock,
          colorClass: 'bg-muted border-border text-foreground',
        };
    }
  };

  const status = ngo?.status || 'PENDING';
  const banner = getStatusBanner(status);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading NGO profile data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Verification Status Banner */}
      <div className={`p-5 rounded-2xl border flex items-start gap-3 shadow-sm ${banner.colorClass}`}>
        <banner.icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-extrabold text-base leading-snug">{banner.label}</h2>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{banner.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Profile details form */}
        <div className="lg:col-span-2">
          <NGOProfileForm
            initialValues={ngo}
            onSubmit={(data) => updateProfile.mutate(data)}
            isSubmitting={updateProfile.isPending}
            status={status}
          />
        </div>

        {/* Credentials uploader card */}
        <div>
          <DocumentUploader
            ngo={ngo}
            onUpload={(formData) => uploadDocuments.mutate(formData)}
            isSubmitting={uploadDocuments.isPending}
          />
        </div>

      </div>

    </div>
  );
};

export default NGOProfileView;
